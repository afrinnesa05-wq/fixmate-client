import { auth, mongoReady } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

/**
 * Better Auth App Router handler.
 *
 * Serves signup / signin / signout / session under `/api/auth/*` using the
 * MongoDB Adapter config in `lib/auth.ts` (same database and secret as the
 * Express backend so JWT minting via `POST /auth/token` keeps working).
 */
const handler = toNextJsHandler(auth)

async function withMongo(
  request: Request,
  run: (req: Request) => Promise<Response>
): Promise<Response> {
  try {
    await mongoReady
  } catch (err) {
    console.error("[Better Auth route] Mongo not ready:", err)
    return Response.json(
      { error: "Database unavailable. Check MONGODB_URI / network." },
      { status: 503 }
    )
  }
  return run(request)
}

export async function GET(request: Request) {
  return withMongo(request, handler.GET)
}
export async function POST(request: Request) {
  return withMongo(request, handler.POST)
}
export async function PUT(request: Request) {
  return withMongo(request, handler.PUT)
}
export async function PATCH(request: Request) {
  return withMongo(request, handler.PATCH)
}
export async function DELETE(request: Request) {
  return withMongo(request, handler.DELETE)
}
