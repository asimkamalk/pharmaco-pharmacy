import type { Metadata } from "next";
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Profile",
};

const ProfilePage = () => {
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
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
              },
            }}
          />
        </div>
      </Container>
    </main>
  );
};

export default ProfilePage;
