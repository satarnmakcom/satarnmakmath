import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      rating: number
      streak: number
      globalRank: number | null
      solvedCount: number
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    rating: number
    streak: number
    globalRank: number | null
    solvedCount?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
    rating: number
    streak: number
    globalRank: number | null
    solvedCount: number
  }
}
