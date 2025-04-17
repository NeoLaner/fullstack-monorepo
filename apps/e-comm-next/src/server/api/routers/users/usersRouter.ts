import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const usersRouter = createTRPCRouter({
  getUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.services.users.getUser(input.id);
      return user;
    }),
});
