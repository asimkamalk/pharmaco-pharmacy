import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

class RestrictedAccountError extends CredentialsSignin {
  code = "restricted";
}

const credentialsSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

const providers: Provider[] = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email or username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const identifier = parsed.data.email.toLowerCase();
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash,
      );
      if (!valid) return null;

      if (user.isRestricted) {
        throw new RestrictedAccountError();
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.unshift(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.id && !user?.email) return true;

      const dbUser = user.id
        ? await prisma.user.findUnique({
            where: { id: user.id },
            select: { isRestricted: true },
          })
        : user.email
          ? await prisma.user.findUnique({
              where: { email: user.email },
              select: { isRestricted: true },
            })
          : null;

      if (dbUser?.isRestricted) {
        if (account?.provider && account.provider !== "credentials") {
          return "/sign-in?error=Restricted";
        }
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "ADMIN" }).role ?? "USER";
      }

      if (!token.id) return token;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isRestricted: true },
        });

        if (!dbUser) {
          return {};
        }

        if (dbUser.isRestricted) {
          return { error: "Restricted" };
        }

        token.role = dbUser.role;
        return token;
      } catch {
        return token;
      }
    },
    async session({ session, token }) {
      if (token.error === "Restricted" || !token.id) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
            name: null,
            email: null,
            image: null,
          },
        };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
  trustHost: true,
});
