import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import User from "@/models/User";
import { connectToDatabase } from "./db";
import bcrypt from "bcryptjs";

// Extend User and JWT right here
interface AppUser extends NextAuthUser {
  id: string;
  image?: string | null;
}

interface AppJWT extends JWT {
  id: string;
  picture?: string | null;
}

export const authOptions: NextAuthOptions = {
  // Use explicit cookie settings so local dev (http) can receive the session cookie.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              password: "",
            });
          }

          (user as AppUser).id = dbUser._id.toString();
        } catch (err) {
          console.error("Google login save error:", err);
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const t = token as AppJWT;

      if (user) {
        const u = user as AppUser;
        t.id = u.id;
        if (u.name) t.name = u.name;
        if (u.email) t.email = u.email;
        if (u.image) t.picture = u.image;
      }

      if (trigger === "update" && session) {
        if (session.name) t.name = session.name;
        if (session.email) t.email = session.email;
        if (session.image) t.picture = session.image;
      }

      return t;
    },

    async session({ session, token }) {
      const t = token as AppJWT;
      if (session.user) {
        session.user.id = t.id;
        if (t.name) session.user.name = t.name;
        if (t.email) session.user.email = t.email;
        if (t.picture) session.user.image = t.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
