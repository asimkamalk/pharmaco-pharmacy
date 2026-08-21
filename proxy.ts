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

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
