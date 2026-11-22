
import { setServers, resolveSrv, resolveTxt } from "node:dns"
import { promisify } from "node:util"

setServers(["8.8.8.8", "8.8.4.4"])

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { nextCookies } from "better-auth/next-js"
import { APIError } from "better-auth/api"
import { MongoClient, ObjectId } from "mongodb"

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
    // TXT records are optional.
  }

  const query = new URLSearchParams()

  query.set("ssl", "true")
  query.set("retryWrites", "true")
  query.set("w", "majority")

  for (const [k, v] of url.searchParams.entries()) {
    query.set(k, v)
  }

  for (const [k, v] of txtParams.entries()) {
    if (!query.has(k)) query.set(k, v)
  }

  const auth = url.username
    ? `${url.username}:${url.password}@`
    : ""

  const dbName = url.pathname.replace(/^\//, "")
  const dbPart = dbName ? `/${dbName}` : ""

  return `mongodb://${auth}${hosts}${dbPart}?${query.toString()}`
}

function frontendOrigin(): string {
  return (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  )
}

const globalForMongo = globalThis as typeof globalThis & {
  _fixmateMongoClient?: MongoClient
  _fixmateAuthPromise?: ReturnType<typeof createAuth>
}

async function createAuth() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error("Missing environment variable: MONGODB_URI")
  }

  const resolvedUri = await resolveSrvUri(mongoUri)

  const client = new MongoClient(resolvedUri)

  await client.connect()

  globalForMongo._fixmateMongoClient = client

  const db = client.db("fixmate")

  const socialProviders: Record<
    string,
    { clientId: string; clientSecret: string }
  > = {}

  if (
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET
  ) {
    socialProviders.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
  }

  return betterAuth({
    database: mongodbAdapter(db, { client }),

    trustedOrigins: [frontendOrigin()],

    emailAndPassword: {
      enabled: true,
    },

    ...(Object.keys(socialProviders).length > 0
      ? { socialProviders }
      : {}),

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
            if (!session.userId || !ObjectId.isValid(session.userId)) {
              return
            }

            const doc = await db.collection("users").findOne(
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

    plugins: [nextCookies()],
  })
}

export function getAuth() {
  if (!globalForMongo._fixmateAuthPromise) {
    globalForMongo._fixmateAuthPromise = createAuth().catch((err) => {
      globalForMongo._fixmateAuthPromise = undefined
      globalForMongo._fixmateMongoClient = undefined
      throw err
    })
  }

  return globalForMongo._fixmateAuthPromise!
}

