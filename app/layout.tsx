import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import SiteConfigProvider from "@/components/SiteConfigProvider";
import StoreChrome from "@/components/StoreChrome";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { getSiteConfig } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: {
      template: `%s - ${site.shortName}`,
      default: site.seo.title || site.name,
    },
    description: site.seo.description || site.description,
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: "en_US",
      title: site.seo.title || site.name,
      description: site.seo.description || site.description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, site] = await Promise.all([auth(), getSiteConfig()]);

  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins antialiased">
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
