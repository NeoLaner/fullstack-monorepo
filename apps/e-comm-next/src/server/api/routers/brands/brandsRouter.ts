import { z } from "zod";
import { brands } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const createBrandInputsSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const brandsRouter = createTRPCRouter({
  createBrand: protectedProcedure
    .input(createBrandInputsSchema)
    .mutation(({ input, ctx }) => {
      ctx.db.insert(brands).values(input);
    }),
});
