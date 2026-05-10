import { eq } from "drizzle-orm";
import db from "../../db";
import { user } from "../../db/schema";

export const userService = {
  getAll: async () => {
    return await db.select().from(user);
  },

  getById: async (id: number) => {
    const result = await db.select().from(user).where(eq(user.id, id));
    return result[0];
  },

  create: async (data: typeof user.$inferInsert) => {
    return await db.insert(user).values(data).returning();
  },
};
