import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "alex@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isValidPassword) {
          throw new Error("Invalid email or password")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          rating: user.rating,
          streak: user.streak,
          globalRank: user.globalRank,
          solvedCount: 0
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = (token.role as string) || "USER"
        session.user.rating = (token.rating as number) || 1200
        session.user.streak = (token.streak as number) || 0
        session.user.globalRank = (token.globalRank as number | null) || null
        session.user.solvedCount = (token.solvedCount as number) || 0
      }
      return session
    },
    async jwt({ token, user, trigger }) {
      if (user || trigger === "update") {
        const userId = user?.id || token.sub
        if (!userId) return token

        // Fetch fresh stats from the database
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            submissions: {
              where: { status: "ACCEPTED" }
            }
          }
        })

        if (dbUser) {
          // --- Streak Auto-Update ---
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          let newStreak = dbUser.streak

          if (dbUser.lastLoginAt) {
            const lastLogin = new Date(dbUser.lastLoginAt)
            const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate())
            const diffDays = Math.floor((today.getTime() - lastLoginDay.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
              // Yesterday → increment streak
              newStreak = dbUser.streak + 1
            } else if (diffDays === 0) {
              // Same day → keep streak
              newStreak = dbUser.streak
            } else {
              // Missed a day → reset to 1
              newStreak = 1
            }
          } else {
            // First ever login
            newStreak = 1
          }

          // Update streak and lastLoginAt in DB if it changed
          if (newStreak !== dbUser.streak || !dbUser.lastLoginAt || dbUser.lastLoginAt.toDateString() !== now.toDateString()) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                streak: newStreak,
                lastLoginAt: now,
              }
            })
          }

          token.role = dbUser.role
          token.rating = dbUser.rating
          token.streak = newStreak
          token.globalRank = dbUser.globalRank
          token.solvedCount = dbUser.submissions.length
        }
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
