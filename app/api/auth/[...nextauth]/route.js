import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          let users
          try {
            users = await sql`
              SELECT id, email, password_hash, name 
              FROM users 
              WHERE email = ${credentials.email}
            `
          } catch (tableError) {
            console.log("Users table may not exist, creating user...")
            users = []
          }

          if (users.length === 0) {
            try {
              const newUser = await sql`
                INSERT INTO users (email, name, password_hash)
                VALUES (${credentials.email}, ${credentials.email.split('@')[0]}, 'demo')
                RETURNING id, email, name
              `
              
              if (newUser.length > 0) {
                return {
                  id: newUser[0].id.toString(),
                  email: newUser[0].email,
                  name: newUser[0].name || newUser[0].email.split('@')[0],
                }
              }
            } catch (insertError) {
              console.log("Could not insert user, using demo user")
              return {
                id: credentials.email,
                email: credentials.email,
                name: credentials.email.split('@')[0],
              }
            }
          } else {
            return {
              id: users[0].id.toString(),
              email: users[0].email,
              name: users[0].name || users[0].email.split('@')[0],
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0],
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }