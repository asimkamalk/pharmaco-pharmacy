import type { Metadata } from "next";
import { Suspense } from "react";
import OrderDetailView from "@/components/OrderDetailView";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Order Details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const OrderDetailPage = ({ params }: PageProps) => {
  return (
    <main className="bg-gradient-to-b from-shop_light_pink/30 to-white">
      <Suspense
        fallback={
          <Container className="py-10">
            <div className="h-64 animate-pulse rounded-2xl bg-shop_light_bg" />
          </Container>
        }
      >
        <OrderDetailView params={params} />
      </Suspense>
    </main>
  );
};

export default OrderDetailPage;
