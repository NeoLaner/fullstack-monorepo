import { z } from "zod";
import { productProperties } from "~/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

const createProductInputsSchema = z.object({
  productId: z.number(),
  propertyId: z.number(),
  value: z.string(),
});

export const productPropertiesRouter = createTRPCRouter({
  createProductProperties: protectedProcedure
    .input(createProductInputsSchema)
    .mutation(({ input, ctx }) => {
      ctx.db.insert(productProperties).values(input);
    }),

  createProductsProperties: protectedProcedure
    .input(createProductInputsSchema.array())
    .mutation(({ input, ctx }) => {
      ctx.db.insert(productProperties).values(input);
    }),

  getProductsProperties: publicProcedure.query(async ({ input, ctx }) => {
    return await ctx.db.query.productProperties.findMany({
      where: (pp, { eq }) => eq(pp.value, "Intel"),
      with: { product: true },
    });
  }),
});
