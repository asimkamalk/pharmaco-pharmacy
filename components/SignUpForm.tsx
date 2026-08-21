"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { FaFacebookF, FaGoogle } from "react-icons/fa6";
import { registerUser, type AuthActionState } from "@/lib/actions/auth";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

const initialState: AuthActionState = {};

interface SignUpFormProps {
  googleEnabled: boolean;
  facebookEnabled: boolean;
}

const SignUpForm = ({ googleEnabled, facebookEnabled }: SignUpFormProps) => {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (!state.success || !state.email) return;

    const password = passwordRef.current?.value ?? "";
    if (!password) {
      setOauthError("Account created. Please sign in with your password.");
      return;
    }

    let cancelled = false;

    const completeSignIn = async () => {
      setSigningIn(true);
      const result = await signIn("credentials", {
        email: state.email,
        password,
        redirect: false,
      });

      if (cancelled) return;

      if (result?.error) {
        setSigningIn(false);
        setOauthError("Account created, but sign-in failed. Please sign in.");
        return;
      }

      router.replace("/account");
      router.refresh();
    };

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [state.success, state.email, router]);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthError(null);
    await signIn(provider, { callbackUrl: "/account" });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-darkColor">Create your account</h1>
      <p className="mt-1.5 text-sm text-lightColor">
        Join Pharmaco Pharmacy to manage orders and addresses
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

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-shop_orange">
              {state.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.username && (
            <p className="mt-1 text-xs text-shop_orange">
              {state.fieldErrors.username}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-shop_orange">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-darkColor"
          >
            Password
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-shop_orange">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        {(state.error || oauthError) && (
          <p role="alert" className="text-sm text-shop_orange">
            {state.error || oauthError}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || signingIn}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-shop_btn_dark_green text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90 disabled:opacity-60"
        >
          {pending || signingIn ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-lightColor">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-shop_light_green hover:text-shop_dark_green"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
