import { prismaClient } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

type Provider = 'Google' | 'Credentials';

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
  // Add the secret - REQUIRED in production
  secret: process.env.NEXTAUTH_SECRET,
  
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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const user = await prismaClient.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.log("User has no password (probably OAuth user):", credentials.email);
            return null;
          }

          if (user.provider === 'Credentials' && !user.emailVerified) {
            console.log("Email not verified for:", credentials.email);
            throw new Error("EmailNotVerified");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log("Invalid password for:", credentials.email);
            return null;
          }

          console.log("Successful login for:", credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          // Re-throw specific errors like EmailNotVerified
          if (error instanceof Error && error.message === "EmailNotVerified") {
            throw error;
          }
          // For other errors, return null
          return null;
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;
        
        if (account?.provider === "google") {
          const existingUser = await prismaClient.user.findUnique({
            where: { email: user.email }
          });
          
          if (!existingUser) {
            await prismaClient.user.create({
              data: {
                email: user.email,
                name: user.name || "",
                provider: 'Google' as Provider,
                emailVerified: new Date() 
              }
            });
          } else if (!existingUser.emailVerified) {
            await prismaClient.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() }
            });
          }
          return true;
        }
        
        if (account?.provider === "credentials") {
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Add these for better debugging in production
  debug: process.env.NODE_ENV === "development"
};