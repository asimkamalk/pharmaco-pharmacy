import type { Metadata } from "next";
import CartView from "@/components/CartView";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: `Review the items in your ${siteConfig.name} shopping cart.`,
};

const CartPage = () => {
  return (
    <main className="bg-white">
      <CartView />
    </main>
  );
};

export default CartPage;
