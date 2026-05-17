import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  // Protect all routes except landing page, auth pages, api routes, and static files
  matcher: [
    "/((?!login|register|forgot-password|reset-password|api/auth|api/forgot-password|api/reset-password|api/register|api/send-otp|_next/static|_next/image|favicon.ico)(?!$).*)",
  ],
}
