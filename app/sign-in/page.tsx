import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Pharmaco Pharmacy account",
};

const SignInPage = () => {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const facebookEnabled = Boolean(
    process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET,
  );

  return (
    <main className="bg-gradient-to-b from-shop_light_pink/50 to-shop_light_bg/40">
      <Container className="flex flex-col items-center py-12 sm:py-16">
        <Link
          href="/"
          className="mb-6 text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Back to store
        </Link>
        <Suspense
          fallback={
            <div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-white" />
          }
        >
          <SignInForm
            googleEnabled={googleEnabled}
            facebookEnabled={facebookEnabled}
          />
        </Suspense>
      </Container>
    </main>
  );
};

export default SignInPage;
