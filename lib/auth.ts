import { setServers, resolveSrv, resolveTxt } from "node:dns"
import { promisify } from "node:util"

// Atlas SRV lookup — must run before any MongoClient connects (same as Express).
setServers(["8.8.8.8", "8.8.4.4"])

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { nextCookies } from "better-auth/next-js"
import { APIError } from "better-auth/api"
import { MongoClient, ObjectId } from "mongodb"

/**
 * Next.js Better Auth server config (assignment stack: Better Auth +
 * MongoDB Adapter + JWT role auth on Express).
 *
 * Mirrors `fixmate-server/lib/auth.ts` so both processes share:
 * - the same MongoDB database (`fixmate`) and user documents
 * - the same `BETTER_AUTH_SECRET` (session cookies verify on either side)
 * - the same user model, additional fields, and database hooks
 *
 * Express keeps its own Better Auth instance only to mint/verify JWTs via
 * `POST /auth/token` and `auth.api.getSession` — not as a second login UI.
 */

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error(
    "Missing environment variable: MONGODB_URI (required for Better Auth MongoDB Adapter)"
  )
}
const mongoUri: string = MONGODB_URI

/**
 * Resolve `mongodb+srv://` to a plain host list via public DNS.
 * `dns.setServers` alone is unreliable inside Turbopack workers (SRV still
 * hits the default resolver and fails with ECONNREFUSED). Resolving here and
 * rewriting the URI keeps the MongoDB driver off the SRV path entirely.
 *
 * Mirrors what the driver does for `mongodb+srv`: SRV → hosts, TXT →
 * replicaSet/authSource, and TLS is implied by the `srv` scheme.
 */
async function resolveSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) return uri
  setServers(["8.8.8.8", "8.8.4.4"])
  const doResolveSrv = promisify(resolveSrv)
  const doResolveTxt = promisify(resolveTxt)

  const url = new URL(uri)
  const srvName = url.hostname
  const records = await doResolveSrv(`_mongodb._tcp.${srvName}`)
  if (!records.length) {
    throw new Error(`No SRV records for _mongodb._tcp.${srvName}`)
  }
  const hosts = records.map((r) => `${r.name}:${r.port}`).join(",")

  // TXT: "authSource=admin&replicaSet=atlas-xxxx-shard-0"
  const txtParams = new URLSearchParams()
  try {
    const txts = await doResolveTxt(`_mongodb._tcp.${srvName}`)
    for (const chunks of txts) {
      const joined = chunks.join("")
      for (const pair of joined.split("&")) {
        const [k, v] = pair.split("=")
        if (k && v) txtParams.set(k, v)
      }
    }
  } catch {
    // TXT is optional for some clusters
  }

  const query = new URLSearchParams()
  query.set("ssl", "true")
  query.set("retryWrites", "true")
  query.set("w", "majority")
  for (const [k, v] of url.searchParams.entries()) query.set(k, v)
  for (const [k, v] of txtParams.entries()) {
    if (!query.has(k)) query.set(k, v)
  }

  const auth = url.username
    ? `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}@`
    : ""
  const dbName = url.pathname.replace(/^\//, "")
  const dbPart = dbName ? `/${dbName}` : ""
  return `mongodb://${auth}${hosts}${dbPart}?${query.toString()}`
}

// Reuse one MongoClient across Next.js hot reloads / route invocations.
const globalForMongo = globalThis as typeof globalThis & {
  _fixmateMongoClient?: MongoClient
  _fixmateMongoClientPromise?: Promise<MongoClient>
}

function getMongoClient(): MongoClient {
  if (!globalForMongo._fixmateMongoClient) {
    setServers(["8.8.8.8", "8.8.4.4"])
    const client = new MongoClient(mongoUri)
    globalForMongo._fixmateMongoClient = client
    globalForMongo._fixmateMongoClientPromise = (async () => {
      const resolved = await resolveSrvUri(mongoUri)
      const c = resolved === mongoUri ? client : new MongoClient(resolved)
      await c.connect()
      globalForMongo._fixmateMongoClient = c
      return c
    })().catch((err) => {
      globalForMongo._fixmateMongoClient = undefined
      globalForMongo._fixmateMongoClientPromise = undefined
      throw err
    })
  }
  return globalForMongo._fixmateMongoClient
}

const client = getMongoClient()
const connectReady =
  globalForMongo._fixmateMongoClientPromise ?? Promise.resolve(client)

// Fail fast on the first request if Atlas SRV / auth init breaks — surface a
// real error instead of an empty 500 from an unsettled connection.
void connectReady.catch((err) => {
  console.error("[Better Auth] MongoDB connect failed:", err)
})

function frontendOrigin(): string {
  return (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  )
}

const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }
}

// Wait for the (possibly rewritten) client before wiring the adapter so the
// first Better Auth request never races an in-flight SRV connect.
const auth = await (async () => {
  const readyClient = await connectReady
  const db = readyClient.db("fixmate")

  return betterAuth({
    database: mongodbAdapter(db, { client: readyClient }),

    trustedOrigins: [frontendOrigin()],

    emailAndPassword: {
      enabled: true,
    },

    ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),

    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
        },
        phone: {
          type: "string",
          required: false,
        },
        area: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
        address: {
          type: "string",
          required: false,
        },
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const role =
              user.role === "technician" ? "technician" : "customer"
            return {
              data: {
                ...user,
                role,
              },
            }
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            if (!session.userId || !ObjectId.isValid(session.userId)) return
            const doc = await db
              .collection("users")
              .findOne(
                { _id: new ObjectId(session.userId) },
                { projection: { suspended: 1 } }
              )
            if (doc?.suspended) {
              throw new APIError("FORBIDDEN", {
                message: "This account has been suspended.",
              })
            }
          },
        },
      },
    },

    // Must be last — Next.js cookie bridge for App Router.
    plugins: [nextCookies()],
  })
})()

/** Awaited Mongo connect — used by the route so first hit waits for SRV. */
export const mongoReady = connectReady
export { auth }
