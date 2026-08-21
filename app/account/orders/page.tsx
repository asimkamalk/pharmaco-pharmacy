import type { Metadata } from "next";
import OrdersListView from "@/components/OrdersListView";

export const metadata: Metadata = {
  title: "Order history",
};

const OrdersPage = () => {
  return (
    <main className="bg-gradient-to-b from-shop_light_bg to-white">
      <OrdersListView />
    </main>
  );
};

export default OrdersPage;
