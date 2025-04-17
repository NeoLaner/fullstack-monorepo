import { type InferSelectModel } from "drizzle-orm";
import { cache } from "react";
import type { db as database } from "~/server/db";
import { categories } from "~/server/db/schema";

/*
  Create static separate types and object for dto(security reasons) and application layer pattern 
  @see https://nextjs.org/blog/security-nextjs-server-components-actions
*/

export function getCategoriesServiceMethods(db: typeof database) {
  async function getCategory(id: number) {
    const _category = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.id, id),
    });
    if (!_category) return null;
    return toCategoryDto(_category);
  }

  async function createCategory({
    name,
    parentId,
  }: {
    name: string;
    parentId?: number;
  }) {
    const [_category] = await db
      .insert(categories)
      .values({ name: name, parentCategoryId: parentId })
      .returning();

    if (!_category) return null;
    return toCategoryDto(_category);
  }

  return {
    getCategory: cache(getCategory),
    createCategory,
  };
}

function toCategoryDto(_category: InferSelectModel<typeof categories>) {
  return {
    id: _category.id,
    name: _category.name,
    parentCategoryId: _category.parentCategoryId,
  };
}

export type CategoryData = ReturnType<typeof toCategoryDto>;
