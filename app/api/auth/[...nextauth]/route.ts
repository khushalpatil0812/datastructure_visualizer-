import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import LinkedInProvider from "next-auth/providers/linkedin"
import { v4 as uuidv4 } from "uuid"
import db from "@/lib/db"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const [existingUser] = (await db.query("SELECT * FROM users WHERE email = ?", [user.email])) as any[]

        if (!existingUser || existingUser.length === 0) {
          // Create new user
          const userId = uuidv4()
          await db.query("INSERT INTO users (id, name, email, image, provider) VALUES (?, ?, ?, ?, ?)", [
            userId,
            user.name,
            user.email,
            user.image,
            account.provider,
          ])

          // Create account link
          await db.query(
            "INSERT INTO accounts (id, user_id, provider, provider_account_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              uuidv4(),
              userId,
              account.provider,
              account.providerAccountId,
              account.access_token,
              account.refresh_token,
              account.expires_at,
            ],
          )
        } else {
          // Update user info
          await db.query("UPDATE users SET name = ?, image = ?, last_sign_in = NOW() WHERE email = ?", [
            user.name,
            user.image,
            user.email,
          ])
        }

        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user?.email) {
        try {
          const [dbUser] = (await db.query("SELECT id, is_admin FROM users WHERE email = ?", [
            session.user.email,
          ])) as any[]

          if (dbUser) {
            session.user.id = dbUser.id
            session.user.is_admin = Boolean(dbUser.is_admin)
          }
        } catch (error) {
          console.error("Error fetching user session:", error)
        }
      }
      return session
    },
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
