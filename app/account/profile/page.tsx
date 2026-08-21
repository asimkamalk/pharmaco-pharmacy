import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Profile",
};

const ProfilePage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/account/profile");
  }

  return (
    <main className="bg-shop_light_bg/40">
      <Container className="py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-darkColor">My Profile</h1>
          <Link
            href="/account"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            ← Back to account
          </Link>
        </div>

        <div className="max-w-xl space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-lightColor">
              Name
            </p>
            <p className="mt-1 text-sm font-medium text-darkColor">
              {session.user.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-lightColor">
              Email
            </p>
            <p className="mt-1 text-sm font-medium text-darkColor">
              {session.user.email || "—"}
            </p>
          </div>
          <p className="text-xs text-lightColor">
            Profile details come from your Pharmaco account. Google/Facebook
            accounts sync name and email from the provider.
          </p>
        </div>
      </Container>
    </main>
  );
};

export default ProfilePage;
