
import { getAuth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

type HandlerMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

async function withAuth(
  request: Request,
  method: HandlerMethod
): Promise<Response> {
  try {
    const auth = await getAuth()
    const handler = toNextJsHandler(auth)

    return await handler[method](request)
  } catch (err) {
    console.error("[Better Auth] Initialization failed:", err)

    return Response.json(
      { error: "Database unavailable. Check server configuration." },
      { status: 503 }
    )
  }
}

export async function GET(request: Request) {
  return withAuth(request, "GET")
}

export async function POST(request: Request) {
  return withAuth(request, "POST")
}

export async function PUT(request: Request) {
  return withAuth(request, "PUT")
}

export async function PATCH(request: Request) {
  return withAuth(request, "PATCH")
}

export async function DELETE(request: Request) {
  return withAuth(request, "DELETE")
}
