import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

export const getProductInputsSchema = z.object({ id: z.number() });

export const createProductInputsSchema = z.object({
  categoryId: z.number(),
  name: z.string(),
  price: z.number(),
  sku: z.string(),
  brandId: z.number().optional(),
  description: z.string().optional(),
  netWeight: z.number().optional(),
});

export const productsRouter = createTRPCRouter({
  getProduct: publicProcedure
    .input(getProductInputsSchema)
    .query(({ input, ctx }) => {
      const product = ctx.services.products.getProduct(input.id);
      return product;
    }),

  getAllProducts: publicProcedure.query(async ({ ctx }) => {
    // const products = ctx.services.products.
    const products = await ctx.db.query.products.findMany();
    return products;
  }),

  createProduct: protectedProcedure
    .input(createProductInputsSchema)
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.services.products.createProduct(input);
      return product;
    }),
});
