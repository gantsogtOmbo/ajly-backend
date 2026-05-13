import { eq } from "drizzle-orm";
import db from "../../db";
import { userSurveys, users } from "../../db/schema";

// ── Tier helpers ─────────────────────────────────────────────────────────────

type Tier = "bronze" | "silver" | "gold";
type TierStatus = {
  tier: Tier | null;
  nextTier: Tier | null;
  hint: string[];
  bronzeAt: Date | null;
  silverAt: Date | null;
  goldAt: Date | null;
};

function computeTier(
  user: typeof users.$inferSelect,
  survey: typeof userSurveys.$inferSelect | null,
): Tier | null {
  if (!survey?.completedAt) return null;
  if (survey.workExperienceDetail) return "gold";
  if (user.firstName && user.lastName && user.birthDate) return "silver";
  return "bronze";
}

function buildTierStatus(
  user: typeof users.$inferSelect,
  survey: typeof userSurveys.$inferSelect | null,
): TierStatus {
  const tier = computeTier(user, survey);
  const base = {
    bronzeAt: survey?.bronzeAt ?? null,
    silverAt: survey?.silverAt ?? null,
    goldAt: survey?.goldAt ?? null,
  };

  if (!survey?.completedAt)
    return { tier: null, nextTier: "bronze", hint: ["survey"], ...base };

  if (tier === "bronze") {
    const hint = [
      ...(!user.firstName ? ["firstName"] : []),
      ...(!user.lastName ? ["lastName"] : []),
      ...(!user.birthDate ? ["birthDate"] : []),
    ];
    return { tier: "bronze", nextTier: "silver", hint, ...base };
  }

  if (tier === "silver")
    return { tier: "silver", nextTier: "gold", hint: ["workExperienceDetail"], ...base };

  return { tier: "gold", nextTier: null, hint: [], ...base };
}

// Applies tier update to survey row atomically (timestamps only move forward)
async function applyTierUpdate(
  userId: string,
  newTier: Tier | null,
  currentSurvey: typeof userSurveys.$inferSelect,
) {
  if (!newTier || newTier === currentSurvey.tier) return;

  const now = new Date();
  const timestamps: Partial<typeof userSurveys.$inferInsert> = { tier: newTier };

  if (newTier === "bronze" && !currentSurvey.bronzeAt) timestamps.bronzeAt = now;
  if (newTier === "silver" && !currentSurvey.silverAt) timestamps.silverAt = now;
  if (newTier === "gold" && !currentSurvey.goldAt) timestamps.goldAt = now;

  await db
    .update(userSurveys)
    .set({ ...timestamps, updatedAt: now })
    .where(eq(userSurveys.userId, userId));
}

// ── User service ──────────────────────────────────────────────────────────────

export const userService = {
  getAll: async () => {
    return await db.select().from(users);
  },

  getById: async (id: string) => {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result;
  },

  create: async (data: typeof users.$inferInsert) => {
    return await db.insert(users).values(data).returning();
  },

  setRole: async (id: string, role: "job_seeker" | "employer") => {
    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updated;
  },

  updatePersonal: async (
    userId: string,
    data: { firstName?: string; lastName?: string; birthDate?: string },
  ) => {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();

    const [survey] = await db.select().from(userSurveys).where(eq(userSurveys.userId, userId));
    if (survey) {
      const newTier = computeTier(updated, survey);
      await applyTierUpdate(userId, newTier, survey);
    }

    return buildTierStatus(updated, survey ?? null);
  },

  getTierStatus: async (userId: string): Promise<TierStatus> => {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [survey] = await db.select().from(userSurveys).where(eq(userSurveys.userId, userId));
    return buildTierStatus(user, survey ?? null);
  },
};

// ── Survey service ────────────────────────────────────────────────────────────

type SurveyData = Omit<
  typeof userSurveys.$inferInsert,
  "id" | "userId" | "answeredCount" | "completedAt" | "tier" | "bronzeAt" | "silverAt" | "goldAt" | "createdAt" | "updatedAt"
>;

export const surveyService = {
  get: async (userId: string) => {
    const [survey] = await db.select().from(userSurveys).where(eq(userSurveys.userId, userId));
    return survey ?? null;
  },

  submitStep: async (userId: string, step: number, data: Partial<SurveyData>) => {
    const now = new Date();
    const isComplete = step >= 5;

    const [survey] = await db
      .insert(userSurveys)
      .values({
        id: crypto.randomUUID(),
        userId,
        ...data,
        answeredCount: step,
        completedAt: isComplete ? now : null,
        ...(isComplete ? { tier: "bronze", bronzeAt: now } : {}),
      })
      .onConflictDoUpdate({
        target: userSurveys.userId,
        set: {
          ...data,
          answeredCount: step,
          updatedAt: now,
          ...(isComplete ? { completedAt: now, tier: "bronze" } : {}),
        },
      })
      .returning();

    await db.update(users).set({ surveyStep: step }).where(eq(users.id, userId));

    // If just completed, set bronzeAt if not already set
    if (isComplete && !survey.bronzeAt) {
      await db
        .update(userSurveys)
        .set({ bronzeAt: now })
        .where(eq(userSurveys.userId, userId));
    }

    return survey;
  },

  updateWorkExperience: async (userId: string, detail: string) => {
    const now = new Date();

    const [survey] = await db
      .update(userSurveys)
      .set({ workExperienceDetail: detail, updatedAt: now })
      .where(eq(userSurveys.userId, userId))
      .returning();

    if (!survey) throw new Error("Survey олдсонгүй — эхлээд асуулга бөглөнө үү");

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const newTier = computeTier(user, survey);
    await applyTierUpdate(userId, newTier, survey);

    return buildTierStatus(user, { ...survey, tier: newTier });
  },
};
