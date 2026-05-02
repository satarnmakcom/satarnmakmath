import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  // Protect all routes except auth pages, api routes, and static files
  matcher: [
    "/((?!login|register|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
