import { faker } from "@faker-js/faker";
import type { InferInsertModel } from "drizzle-orm";
import { getProductPropertiesServiceMethods } from "~/server/api/routers/productProperties/productPropertiesService";
import { getProductServiceMethods } from "~/server/api/routers/products/productsService";
import { getPropertiesServiceMethods } from "~/server/api/routers/properties/propertiesService";
import type { products } from "~/server/db/schema";
import { db } from "./db";

const services = getProductServiceMethods(db);
const productPropertiesService = getProductPropertiesServiceMethods(db);
const propertiesService = getPropertiesServiceMethods(db);

const laptopNames = [
  "asus z",
  "hp volka",
  "apple mac",
  "surface studio",
  "lenovo gaming",
];

export async function insertProducts(totalCount: number) {
  // Step 1: Insert the three properties for laptops (categoryId: 2)
  const propertiesToInsert = [
    { name: "CPU Manufacture", type: "enum" as const, categoryId: 2 },
    { name: "CPU Generation", type: "number" as const, categoryId: 2 },
    { name: "CPU Name", type: "string" as const, categoryId: 2 },
  ];
  const insertedProperties =
    await propertiesService.createProperties(propertiesToInsert);
  if (!insertedProperties) throw new Error("Failed to insert properties");

  const BATCH_SIZE = 6000; // Set batch size to avoid exceeding max parameters

  // Process products and properties in batches
  for (let i = 0; i < totalCount; i += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, totalCount - i);
    const productsMock: InferInsertModel<typeof products>[] = [];
    // Step 2: Generate products batch
    for (let j = 0; j < batchCount; j++) {
      const name = laptopNames[Math.floor(Math.random() * laptopNames.length)]!;
      const price = +Number(faker.commerce.price()).toFixed(0);
      const sku = faker.commerce.isbn() + `${i}${j}`;
      const categoryId = 2;
      productsMock.push({ price, categoryId, name, sku });
    }
    const insertedProducts =
      (await services.createProducts(productsMock)) ?? [];

    // Step 3: Generate product properties for inserted batch
    const productPropertiesMock = [];
    for (const product of insertedProducts) {
      let manufacture: string | undefined; // store CPU Manufacture per product
      let generation: number | undefined; // store CPU Generation per product
      for (const property of insertedProperties) {
        let value: string;
        if (property.name === "CPU Manufacture") {
          manufacture = faker.helpers.arrayElement(["Intel", "AMD"]);
          value = manufacture;
        } else if (property.name === "CPU Generation") {
          if (manufacture === "Intel") {
            generation = faker.number.int({ min: 10, max: 13 });
          } else if (manufacture === "AMD") {
            generation = faker.number.int({ min: 3, max: 7 });
          } else {
            generation = faker.number.int({ min: 10, max: 13 });
          }
          value = generation.toString();
        } else if (property.name === "CPU Name") {
          if (manufacture === "Intel") {
            const intelType = faker.helpers.arrayElement(["i3", "i5", "i7"]);
            if (!generation)
              generation = faker.number.int({ min: 10, max: 13 });
            if (intelType === "i3") {
              value = `i3 ${generation}100`;
            } else if (intelType === "i5") {
              value = `i5 ${generation}400f`;
            } else {
              value = `i7 ${generation}700k`;
            }
          } else if (manufacture === "AMD") {
            const amdType = faker.helpers.arrayElement([
              "Ryzen 3",
              "Ryzen 5",
              "Ryzen 7",
            ]);
            if (!generation) generation = faker.number.int({ min: 3, max: 7 });
            if (amdType === "Ryzen 3") {
              value = `Ryzen 3 ${generation}200G`;
            } else if (amdType === "Ryzen 5") {
              value = `Ryzen 5 ${generation}600X`;
            } else {
              value = `Ryzen 7 ${generation}800X`;
            }
          } else {
            value = "Unknown";
          }
        } else {
          throw new Error("Unknown property");
        }
        productPropertiesMock.push({
          productId: product.id,
          propertyId: property.id,
          value, // ensures value is never undefined
        });
      }
    }
    // Step 4: Insert properties for current batch
    await productPropertiesService.createProductProperties(
      productPropertiesMock,
    );
  }
}
