import { excPromisesInSeq } from "~/lib/utils";
import { getCategoriesServiceMethods } from "~/server/api/routers/categories/categoriesService";
import { db } from "./db";

const services = getCategoriesServiceMethods(db);

export async function insertCategories() {
  const categoriesMockData = [
    {
      id: 1,
      name: "electrics",
      parent_category_id: null,
      description: "digital",
    },
    {
      id: 2,
      name: "laptops",
      parent_category_id: 1,
      description: "laptops",
    },
  ];

  const categoriesSqlPromisesFn = categoriesMockData.map(
    (category, i) => async () => {
      await services.createCategory(category);
    },
  );

  await excPromisesInSeq(categoriesSqlPromisesFn);
}
