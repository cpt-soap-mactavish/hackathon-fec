import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findFirst({
          where: { 
            username: {
              equals: credentials.username,
              mode: 'insensitive'
            }
          }
        });

        if (!user) {
          throw new Error("Invalid Login ID or Password");
        }

        if (!user.password) {
             throw new Error("Please login with Google");
        }

        // if (!user.isVerified) {
        //   throw new Error("Please verify your email first");
        // }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid Login ID or Password");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            image: user.image
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (!existingUser) {
             // Generate a random username for Google users or prompt them?
             // For now, let's use email prefix + random string
             const randomSuffix = Math.floor(Math.random() * 10000);
             const username = user.email.split('@')[0] + randomSuffix;
             
            await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                username: username,
                image: user.image,
                isVerified: true,
              }
            });
          }
          return true;
        } catch (error) {
          console.log("Error saving user", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.username = user.username;
            token.role = user.role;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id;
            session.user.username = token.username;
            session.user.role = token.role;
        }
        return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
