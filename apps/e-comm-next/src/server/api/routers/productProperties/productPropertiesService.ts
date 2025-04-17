import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { db as database } from "~/server/db";
import { productProperties } from "~/server/db/schema";

export function getProductPropertiesServiceMethods(db: typeof database) {
  async function createProductProperty(
    input: InferInsertModel<typeof productProperties>,
  ) {
    const [_productProperty] = await db
      .insert(productProperties)
      .values(input)
      .returning();

    if (!_productProperty) throw Error("Can't create product.");
    return toProductPropertyDto(_productProperty);
  }

  async function createProductProperties(
    input: InferInsertModel<typeof productProperties>[],
  ) {
    const _productProperties = await db
      .insert(productProperties)
      .values(input)
      .returning();

    if (!_productProperties) return null;
    return _productProperties.map((_productProperty) =>
      toProductPropertyDto(_productProperty),
    );
  }

  return {
    createProductProperty,
    createProductProperties,
  };
}

function toProductPropertyDto(
  _productProperty: InferSelectModel<typeof productProperties>,
) {
  return _productProperty;
}

export type PropertyData = ReturnType<typeof toProductPropertyDto>;
