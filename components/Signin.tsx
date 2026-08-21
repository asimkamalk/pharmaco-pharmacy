"use client";

import { ClerkLoading, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { MapPinned, Package, UserRound } from "lucide-react";

const Signin = () => {
  return (
    <>
      <ClerkLoading>
        <span
          aria-hidden
          className="h-7 w-7 animate-pulse rounded-full bg-shop_light_bg"
        />
      </ClerkLoading>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-full border border-shop_dark_green/15 bg-shop_light_pink/60 px-3.5 py-1.5 text-sm font-semibold text-shop_dark_green transition-colors duration-200 hover:cursor-pointer hover:bg-shop_light_pink">
            Login
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="My Account"
              labelIcon={<UserRound className="h-4 w-4" />}
              href="/account"
            />
            <UserButton.Link
              label="Addresses"
              labelIcon={<MapPinned className="h-4 w-4" />}
              href="/account/addresses"
            />
            <UserButton.Link
              label="My Orders"
              labelIcon={<Package className="h-4 w-4" />}
              href="/account/orders"
            />
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </>
  );
};

export default Signin;
