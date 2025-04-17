import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { brandsRouter } from "./routers/brands/brandsRouter";
import { categoriesRouter } from "./routers/categories/categoriesRouter";
import { productPropertiesRouter } from "./routers/productProperties/productPropertiesRouter";
import { productsRouter } from "./routers/products/productsRouter";
import { usersRouter } from "./routers/users/usersRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  products: productsRouter,
  productProperties: productPropertiesRouter,
  brands: brandsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
