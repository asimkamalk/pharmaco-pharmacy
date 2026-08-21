const ProductCardSkeleton = () => {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="aspect-square w-full bg-shop_light_bg" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-3 w-1/3 rounded bg-shop_light_bg" />
        <div className="h-4 w-full rounded bg-shop_light_bg" />
        <div className="h-4 w-2/3 rounded bg-shop_light_bg" />
        <div className="mt-auto space-y-3 pt-1">
          <div className="h-4 w-1/3 rounded bg-shop_light_bg" />
          <div className="h-9 w-full rounded-lg bg-shop_light_bg" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
