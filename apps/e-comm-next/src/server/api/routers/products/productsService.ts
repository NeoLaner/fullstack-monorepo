import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { cache } from "react";
import type { db as database } from "~/server/db";
import { products } from "~/server/db/schema";

export function getProductServiceMethods(db: typeof database) {
  async function getProduct(id: number) {
    const _product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id),
    });

    if (!_product) return null;
    return toProductDto(_product);
  }

  async function createProduct(input: InferInsertModel<typeof products>) {
    const [_product] = await db.insert(products).values(input).returning();

    if (!_product) throw Error("Can't create product.");
    return toProductDto(_product);
  }

  async function createProducts(input: InferInsertModel<typeof products>[]) {
    const _products = await db.insert(products).values(input).returning();

    if (!_products) return null;
    return _products.map((_product) => toProductDto(_product));
  }

  return {
    getProduct: cache(getProduct),
    createProduct,
    createProducts,
  };
}

function toProductDto(_product: InferSelectModel<typeof products>) {
  return {
    id: _product.id,
    name: _product.name,
    description: _product.description,
    price: _product.price,
    netWeight: _product.netWeight,
  };
}

export type ProductData = ReturnType<typeof toProductDto>;
