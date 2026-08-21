import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";
import { getPendingOrderNotifications } from "@/lib/admin-notifications";

export async function GET() {
  const session = await auth();
  if (!(await isAdminUser(session?.user?.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPendingOrderNotifications();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
