import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: "USER" | "ADMIN";
      discountPercent?: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "USER" | "ADMIN";
    discountPercent?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    discountPercent?: number;
    error?: string;
  }
}
