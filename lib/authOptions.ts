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
    strategy: "jwt"
  },
};