import { insertCategories } from "./categories";
import { insertProducts } from "./products";

async function runScripts() {
  const before = Date.now();
  console.log("[o] Inserting Started");

  logStart("categories");
  await insertCategories();
  logEnd("categories");

  logStart("products");
  await insertProducts(5000);
  logEnd("products");

  console.log("[x] Inserting Ended");
  console.log(`Inserting take ${Date.now() - before}ms to finished `);
}

await runScripts();
process.exit();

function logStart(tableName: string) {
  console.log(`${tableName} scripts are started`);
}

function logEnd(tableName: string) {
  console.log(`${tableName} scripts are ended`);
}
