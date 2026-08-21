import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { auth } from "@/auth";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "My Account",
  description: `Manage your ${siteConfig.name} account, addresses and orders.`,
};

const accountLinks = [
  {
    href: "/account/profile",
    title: "Profile",
    description: "View your account name and email",
  },
  {
    href: "/account/addresses",
    title: "Addresses",
    description: "Save Home, Office and other delivery addresses",
  },
  {
    href: "/account/orders",
    title: "Orders",
    description: "Track order status and payment details",
  },
];

const AccountPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/account");
  }

  return (
    <main className="bg-gradient-to-b from-shop_light_pink/40 to-white">
      <Container className="py-10 sm:py-12">
        <h1 className="text-2xl font-bold text-darkColor sm:text-3xl">
          My Account
        </h1>
        <p className="mt-1.5 text-sm text-lightColor">
          Welcome{session.user.name ? `, ${session.user.name}` : ""}. Manage
          your profile, delivery addresses and orders.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all duration-200 hover:border-shop_light_green/50 hover:shadow-md"
            >
              <h2 className="font-semibold text-darkColor">{link.title}</h2>
              <p className="mt-1.5 text-sm text-lightColor">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
};

export default AccountPage;
