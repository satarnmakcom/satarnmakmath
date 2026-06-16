import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    error?: "BannedUser"
    user: {
      id: string
      role: string
      rating: number
      streak: number
      globalRank: number | null
      solvedCount: number
    } & DefaultSession["user"]
  }
}
