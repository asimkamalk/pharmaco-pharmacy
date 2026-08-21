import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedMatchers = [
  /^\/account(\/|$)/,
  /^\/checkout(\/|$)/,
  /^\/admin(\/|$)/,
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedMatchers.some((pattern) =>
    pattern.test(pathname),
  );

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Exclude Auth.js API routes — wrapping them breaks /api/auth/session
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
