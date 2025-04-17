import type { ProductData } from "~/server/api/routers/products/productsService";

export function ProductGrid({ products }: { products: ProductData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border p-4 shadow-sm hover:shadow-md"
        >
          <h3 className="text-lg font-semibold">{product.name}</h3>
          {/* Add more product details as needed */}
        </div>
      ))}
    </div>
  );
}
