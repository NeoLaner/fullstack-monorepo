import { api, HydrateClient } from "~/trpc/server";
import { MarketNavigationMenu } from "./_ui/market-navigation-menu";
import { ProductGrid } from "./_ui/product-grid";

export default async function Home() {
  const products = await api.products.getAllProducts();

  return (
    <HydrateClient>
      <section>
        <MarketNavigationMenu />
      </section>
      <section className="container mx-auto p-4">
        <ProductGrid products={products} />
      </section>
      <button
        onClick={async () => {
          "use server";
          await api.categories.createCategory({ name: "test" });
        }}
      >
        create category
      </button>
    </HydrateClient>
  );
}
