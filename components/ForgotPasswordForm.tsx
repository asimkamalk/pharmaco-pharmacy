"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  type PasswordResetActionState,
} from "@/lib/actions/auth";

const inputClasses =
  "w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-darkColor outline-none transition-colors duration-200 placeholder:text-lightColor/60 focus:border-shop_light_green";

const initialState: PasswordResetActionState = {};

const ForgotPasswordForm = () => {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-darkColor">Request sent</h1>
        <p className="mt-3 text-sm leading-relaxed text-lightColor">
          Your password reset request has been sent to the admin. They will
          verify your username and email, then help you with a new password.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-shop_btn_dark_green text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-darkColor">Forgot password?</h1>
      <p className="mt-1.5 text-sm text-lightColor">
        Enter your username and email for verification. Our admin will reset
        your password after confirming it&apos;s you.
      </p>

      <form action={action} className="mt-6 space-y-4">
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
            placeholder="Enter your username"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.username && (
            <p className="mt-1.5 text-xs text-shop_orange">
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
            placeholder="Enter your email"
            className={inputClasses}
            required
          />
          {state.fieldErrors?.email && (
            <p className="mt-1.5 text-xs text-shop_orange">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-shop_orange">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-shop_btn_dark_green text-sm font-semibold text-white transition-colors duration-200 hover:bg-shop_dark_green/90 disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send request to admin"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-lightColor">
        Remembered it?{" "}
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

export default ForgotPasswordForm;
