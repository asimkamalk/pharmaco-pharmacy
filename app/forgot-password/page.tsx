import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset from Pharmaco Pharmacy admin",
};

const ForgotPasswordPage = () => {
  return (
    <main className="bg-gradient-to-b from-shop_light_pink/50 to-shop_light_bg/40">
      <Container className="flex flex-col items-center py-12 sm:py-16">
        <Link
          href="/sign-in"
          className="mb-6 text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
        >
          ← Back to sign in
        </Link>
        <ForgotPasswordForm />
      </Container>
    </main>
  );
};

export default ForgotPasswordPage;
