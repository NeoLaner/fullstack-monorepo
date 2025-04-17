import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { cache } from "react";
import type { db as database } from "~/server/db";
import { properties } from "~/server/db/schema";

export function getPropertiesServiceMethods(db: typeof database) {
  async function getProperty(id: number) {
    const _property = await db.query.properties.findFirst({
      where: (property, { eq }) => eq(property.id, id),
    });

    if (!_property) return null;
    return toPropertyDto(_property);
  }

  async function createProperty(input: InferInsertModel<typeof properties>) {
    const [_property] = await db.insert(properties).values(input).returning();

    if (!_property) throw Error("Can't create product.");
    return toPropertyDto(_property);
  }

  async function createProperties(
    input: InferInsertModel<typeof properties>[],
  ) {
    const _properties = await db.insert(properties).values(input).returning();

    if (!_properties) return null;
    return _properties.map((_property) => toPropertyDto(_property));
  }

  return {
    getProperty: cache(getProperty),
    createProperty,
    createProperties,
  };
}

function toPropertyDto(_property: InferSelectModel<typeof properties>) {
  return {
    id: _property.id,
    name: _property.name,
    type: _property.type,
  };
}

export type PropertyData = ReturnType<typeof toPropertyDto>;
