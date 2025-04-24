// lib/authOptions.ts
import { prismaClient } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Provider } from "@prisma/client";

// Extended types for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
    }
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified?: Date | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prismaClient.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.provider === 'Credentials' && !user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      
      // Always allow Google login - Google already verifies emails
      if (account?.provider === "google") {
        // Check if user exists in our DB
        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email }
        });
        
        if (!existingUser) {
          // Create new user with verified email
          await prismaClient.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              provider: 'Google' as Provider,
              emailVerified: new Date() // Mark as verified since Google already verified it
            }
          });
        } else if (!existingUser.emailVerified) {
          // If user exists but email not verified, mark it as verified now
          await prismaClient.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          });
        }
        return true;
      }
      
      // For credentials login, authorize() already checked email verification
      if (account?.provider === "credentials") {
        return true;
      }
      
      return false;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        
        if (token.emailVerified) {
          session.user.emailVerified = token.emailVerified as Date;
        }
      }
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        // Store the user ID in the token
        token.id = user.id;
        
        if (user.emailVerified) {
          token.emailVerified = user.emailVerified;
        }
      }
      return token;
    }
  },
  
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/auth/error'
  },
  
  session: {
    strategy: "jwt"
  },
};