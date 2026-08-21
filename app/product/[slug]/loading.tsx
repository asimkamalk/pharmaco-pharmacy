import Container from "@/components/Container";

const ProductLoading = () => {
  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <div className="h-4 w-64 animate-pulse rounded bg-shop_light_bg" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="aspect-square w-full animate-pulse rounded-xl bg-shop_light_bg" />
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-shop_light_bg" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-shop_light_bg" />
            <div className="h-6 w-32 animate-pulse rounded bg-shop_light_bg" />
            <div className="h-4 w-full animate-pulse rounded bg-shop_light_bg" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-shop_light_bg" />
            <div className="h-11 w-56 animate-pulse rounded-lg bg-shop_light_bg" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-shop_light_bg" />
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ProductLoading;
