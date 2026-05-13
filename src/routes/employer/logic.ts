import { eq } from "drizzle-orm";
import db from "../../db";
import { employerProfiles, employerSearches } from "../../db/schema";

export const employerService = {
  getProfile: async (userId: string) => {
    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, userId));
    return profile ?? null;
  },

  upsertProfile: async (userId: string, data: { companyName?: string }) => {
    const [profile] = await db
      .insert(employerProfiles)
      .values({ id: crypto.randomUUID(), userId, ...data })
      .onConflictDoUpdate({
        target: employerProfiles.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();
    return profile;
  },

  listSearches: async (employerId: string) => {
    return db.select().from(employerSearches).where(eq(employerSearches.employerId, employerId));
  },

  createSearch: async (
    employerId: string,
    data: Omit<typeof employerSearches.$inferInsert, "id" | "employerId" | "createdAt" | "updatedAt">,
  ) => {
    const [search] = await db
      .insert(employerSearches)
      .values({ id: crypto.randomUUID(), employerId, ...data })
      .returning();
    return search;
  },

  updateSearch: async (
    id: string,
    employerId: string,
    data: Partial<Omit<typeof employerSearches.$inferInsert, "id" | "employerId" | "createdAt" | "updatedAt">>,
  ) => {
    const [search] = await db
      .update(employerSearches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employerSearches.id, id))
      .returning();
    return search ?? null;
  },

  deleteSearch: async (id: string) => {
    await db.delete(employerSearches).where(eq(employerSearches.id, id));
  },
};
