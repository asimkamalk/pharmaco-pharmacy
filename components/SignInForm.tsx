"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaFacebookF, FaGoogle } from "react-icons/fa6";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

interface SignInFormProps {
  googleEnabled: boolean;
  facebookEnabled: boolean;
}

const SignInForm = ({ googleEnabled, facebookEnabled }: SignInFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    errorParam ? "Sign-in failed. Please check your details and try again." : null,
  );
  const [pending, setPending] = useState(false);

  const finishSignIn = async () => {
    router.replace(callbackUrl.startsWith("/") ? callbackUrl : "/account");
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Invalid email/username or password.");
      return;
    }

    await finishSignIn();
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setError(null);
    await signIn(provider, {
      callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : "/account",
    });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-darkColor">
        Sign in to Pharmaco Pharmacy
      </h1>
      <p className="mt-1.5 text-sm text-lightColor">
        Welcome back! Please sign in to continue
      </p>

      {(googleEnabled || facebookEnabled) && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {facebookEnabled && (
            <button
              type="button"
              onClick={() => handleOAuth("facebook")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/15 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-[#1877F2] hover:text-[#1877F2]"
            >
              <FaFacebookF className="h-4 w-4 text-[#1877F2]" />
              Facebook
            </button>
          )}
          {googleEnabled && (
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-black/15 text-sm font-semibold text-darkColor transition-colors duration-200 hover:border-shop_light_green hover:text-shop_dark_green"
            >
              <FaGoogle className="h-4 w-4 text-[#EA4335]" />
              Google
            </button>
          )}
        </div>
      )}

      {(googleEnabled || facebookEnabled) && (
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-black/10" />
          <span className="text-xs font-medium uppercase tracking-wide text-lightColor">
            or
          </span>
          <span className="h-px flex-1 bg-black/10" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Email address or username
          </label>
          <input
            id="email"
            name="email"
            type="text"
            autoComplete="username"
            placeholder="Enter email or username"
            className={inputClasses}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            className={inputClasses}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-shop_orange">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-shop_btn_dark_green text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-lightColor">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-shop_light_green hover:text-shop_dark_green"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInForm;
