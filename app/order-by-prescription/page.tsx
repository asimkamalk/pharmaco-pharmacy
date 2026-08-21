import type { Metadata } from "next";
import Container from "@/components/Container";
import OrderByPrescriptionForm from "@/components/OrderByPrescriptionForm";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Order by Prescription",
  description:
    "Upload your prescription and tell us which medicines you need. Our pharmacist will prepare your order.",
};

const OrderByPrescriptionPage = async () => {
  const session = await auth();

  return (
    <Container className="py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-shop_orange">
          Pharmacist-assisted order
        </p>
        <h1 className="mt-2 text-2xl font-bold text-darkColor sm:text-3xl">
          Order by prescription
        </h1>
        <p className="mt-2 text-sm text-lightColor sm:text-base">
          Upload your prescription and choose a delivery address. Our
          pharmacist will build the order for you.
        </p>

        <div className="mt-8">
          <OrderByPrescriptionForm
            isSignedIn={Boolean(session?.user?.id)}
          />
        </div>
      </div>
    </Container>
  );
};

export default OrderByPrescriptionPage;
