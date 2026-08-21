import Container from "@/components/Container";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

const ShopLoading = () => {
  return (
    <main className="bg-white">
      <Container className="py-8 sm:py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-shop_light_bg" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-shop_light_bg" />

        <div className="mt-6 flex gap-8">
          <div className="hidden w-60 shrink-0 lg:block">
            <div className="h-96 animate-pulse rounded-xl border border-black/10 bg-shop_light_bg/60" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between">
              <div className="h-9 w-24 animate-pulse rounded-lg bg-shop_light_bg lg:hidden" />
              <div className="ml-auto h-9 w-40 animate-pulse rounded-lg bg-shop_light_bg" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ShopLoading;
