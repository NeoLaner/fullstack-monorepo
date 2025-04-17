import { unauthorized } from "next/navigation";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

const getCategoryInputsSchema = z.object({ id: z.number() });

const createCategoryInputsSchema = z.object({
  name: z.string(),
  parentId: z.number().optional(),
});

export const categoriesRouter = createTRPCRouter({
  getCategory: publicProcedure
    .input(getCategoryInputsSchema)
    .query(async ({ input, ctx }) => {
      const category = await ctx.services.categories.getCategory(input.id);
      return category;
    }),

  createCategory: protectedProcedure
    .input(createCategoryInputsSchema)
    .mutation(({ input, ctx }) => {
      if (!ctx.dal.checkAccess("CREATE", "Category")) unauthorized();
      const category = ctx.services.categories.createCategory(input);
      return category;
    }),
});
