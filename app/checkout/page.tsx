import type { Metadata } from "next";
import CheckoutView from "@/components/CheckoutView";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Complete your order at ${siteConfig.name} with Cash on Delivery, bank transfer, EasyPaisa or JazzCash.`,
};

const CheckoutPage = () => {
  return (
    <main className="bg-gradient-to-b from-shop_light_bg/80 to-white">
      <CheckoutView />
    </main>
  );
};

export default CheckoutPage;
