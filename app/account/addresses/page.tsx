import type { Metadata } from "next";
import Link from "next/link";
import AddressManager from "@/components/AddressManager";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Addresses",
};

const AddressesPage = () => {
  return (
    <main className="bg-gradient-to-b from-shop_light_bg to-white">
      <Container className="py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-darkColor">
              Saved Addresses
            </h1>
            <p className="mt-1 text-sm text-lightColor">
              Add Home, Office or other delivery locations for faster checkout.
            </p>
          </div>
          <Link
            href="/account"
            className="text-sm font-medium text-shop_light_green hover:text-shop_dark_green"
          >
            ← Back to account
          </Link>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <AddressManager />
        </div>
      </Container>
    </main>
  );
};

export default AddressesPage;
