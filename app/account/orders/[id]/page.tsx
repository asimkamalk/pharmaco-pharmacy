import type { Metadata } from "next";
import OrderDetailView from "@/components/OrderDetailView";

export const metadata: Metadata = {
  title: "Order Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}

const OrderDetailPage = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const { confirmed } = await searchParams;

  return (
    <main className="bg-gradient-to-b from-shop_light_pink/30 to-white">
      <OrderDetailView orderId={id} justConfirmed={confirmed === "1"} />
    </main>
  );
};

export default OrderDetailPage;
