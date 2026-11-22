
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

/**
 * Browser Better Auth client. Talks to this Next.js app at `/api/auth/*`,
 * served by `app/api/auth/[...all]/route.ts` → `lib/auth.ts`
 * (Better Auth + MongoDB Adapter). Omitting `baseURL` resolves
 * `window.location.origin` in the browser so requests stay same-origin.
 */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
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
    }),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
