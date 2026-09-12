import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import JsonLd from "@/components/JsonLd";
import SiteConfigProvider from "@/components/SiteConfigProvider";
import StoreChrome from "@/components/StoreChrome";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { getSiteConfig } from "@/lib/site";
import {
  buildLocalBusinessJsonLd,
  buildRootMetadata,
  buildWebsiteJsonLd,
} from "@/lib/seo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return buildRootMetadata(site);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, site] = await Promise.all([auth(), getSiteConfig()]);

  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <JsonLd
          data={[buildLocalBusinessJsonLd(site), buildWebsiteJsonLd(site)]}
        />
        <AuthSessionProvider session={session}>
          <SiteConfigProvider value={site}>
            <StoreChrome header={<Header />} footer={<Footer />}>
              {children}
            </StoreChrome>
          </SiteConfigProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
