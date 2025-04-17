import { z } from "zod";
import { properties, propertiesTypeEnum } from "~/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../../trpc";

const createPropertyInputsSchema = z.object({
  name: z.string(),
  type: z.enum(propertiesTypeEnum),
  categoryId: z.number(),
});

export const propertiesRouter = createTRPCRouter({
  createProperty: protectedProcedure
    .input(createPropertyInputsSchema)
    .mutation(({ input, ctx }) => {
      ctx.db.insert(properties).values(input);
    }),

  createProperties: protectedProcedure
    .input(createPropertyInputsSchema.array())
    .mutation(({ input, ctx }) => {
      ctx.db.insert(properties).values(input);
    }),

  getProperty: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return;
    }),
});
