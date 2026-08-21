import type { Metadata } from "next";
import WishlistView from "@/components/WishlistView";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Wishlist",
  description: `Products you have saved for later at ${siteConfig.name}.`,
};

const WishlistPage = () => {
  return (
    <main className="bg-white">
      <WishlistView />
    </main>
  );
};

export default WishlistPage;
