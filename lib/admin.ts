import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/account?error=unauthorized");
  }

  return { session, user };
}

export async function isAdminUser(userId?: string | null) {
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}
