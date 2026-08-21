import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { headers } from "next/headers";

import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/auth";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s - Pharmaco Pharmacy",
    default: "Pharmaco Pharmacy | Hayatabad, Peshawar",
  },
  description:
    "Pharmaco Pharmacy is a trusted pharmacy in Hayatabad, Peshawar, offering medicines, healthcare products, wellness essentials, and personal care items.",
  openGraph: {
    siteName: "Pharmaco Pharmacy",
    type: "website",
    locale: "en_US",
    title: "Pharmaco Pharmacy | Hayatabad, Peshawar",
    description:
      "Medicines, healthcare products, wellness essentials and personal care items from a trusted pharmacy in Hayatabad, Peshawar.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins antialiased">
        <AuthSessionProvider session={session}>
          {!isAdmin && <Header />}
          {children}
          {!isAdmin && <Footer />}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
