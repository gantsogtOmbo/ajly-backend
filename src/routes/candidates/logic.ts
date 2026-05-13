import { and, count, eq, sql } from "drizzle-orm";
import db from "../../db";
import { employerProfiles, employerSearches, userSurveys } from "../../db/schema";

type Search = typeof employerSearches.$inferSelect;
type Candidate = typeof userSurveys.$inferSelect;

function scoreCandidate(candidate: Candidate, search: Search): number {
  const w = {
    contract: search.weightContract,
    availability: search.weightAvailability,
    salary: search.weightSalary,
    physical: search.weightPhysical,
    hours: search.weightHours,
    skills: search.weightSkills,
  };
  const total = w.contract + w.availability + w.salary + w.physical + w.hours + w.skills;
  if (total === 0) return 0;

  let earned = 0;

  if (!search.requiredContract || candidate.contractType === search.requiredContract)
    earned += w.contract;
  if (!search.requiredAvailability || candidate.availableFrom === search.requiredAvailability)
    earned += w.availability;
  if (!search.offeredSalary || candidate.salaryRange === search.offeredSalary)
    earned += w.salary;
  if (!search.requiredPhysical || candidate.physicalCapability === search.requiredPhysical)
    earned += w.physical;
  if (!search.requiredHours || candidate.hoursPerWeek === search.requiredHours)
    earned += w.hours;

  // Skills overlap: any match counts
  const reqSkills = search.requiredSkills;
  if (!reqSkills || reqSkills.length === 0) {
    earned += w.skills;
  } else if (candidate.skills?.some((s) => reqSkills.includes(s))) {
    earned += w.skills;
  }

  return Math.round((earned / total) * 100);
}

function buildWhereConditions(search: Search) {
  const conditions = [];

  if (search.requiredContract)
    conditions.push(eq(userSurveys.contractType, search.requiredContract));
  if (search.requiredAvailability)
    conditions.push(eq(userSurveys.availableFrom, search.requiredAvailability));
  if (search.offeredSalary)
    conditions.push(eq(userSurveys.salaryRange, search.offeredSalary));
  if (search.requiredPhysical)
    conditions.push(eq(userSurveys.physicalCapability, search.requiredPhysical));
  if (search.requiredHours)
    conditions.push(eq(userSurveys.hoursPerWeek, search.requiredHours));
  if (search.requiredJobTypes?.length)
    conditions.push(sql`${userSurveys.previousJobTypes} && ARRAY[${sql.join(
      search.requiredJobTypes.map((j) => sql`${j}`),
      sql`, `,
    )}]::text[]`);
  if (search.requiredSkills?.length)
    conditions.push(sql`${userSurveys.skills} && ARRAY[${sql.join(
      search.requiredSkills.map((s) => sql`${s}`),
      sql`, `,
    )}]::text[]`);
  if (search.requiredShifts?.length)
    conditions.push(sql`${userSurveys.shifts} && ARRAY[${sql.join(
      search.requiredShifts.map((s) => sql`${s}`),
      sql`, `,
    )}]::text[]`);

  return conditions.length > 0 ? and(...conditions) : undefined;
}

async function getSearch(searchId: string, userId: string) {
  const [profile] = await db
    .select()
    .from(employerProfiles)
    .where(eq(employerProfiles.userId, userId));
  if (!profile) throw new Error("Employer profile олдсонгүй");

  const [search] = await db
    .select()
    .from(employerSearches)
    .where(eq(employerSearches.id, searchId));
  if (!search || search.employerId !== profile.id) throw new Error("Search олдсонгүй");

  return search;
}

export const candidatesService = {
  count: async (searchId: string, userId: string) => {
    const search = await getSearch(searchId, userId);
    const where = buildWhereConditions(search);
    const [result] = await db.select({ count: count() }).from(userSurveys).where(where);
    return { count: result.count };
  },

  list: async (searchId: string, userId: string, page: number, limit: number) => {
    const search = await getSearch(searchId, userId);
    const where = buildWhereConditions(search);

    const candidates = await db
      .select()
      .from(userSurveys)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit);

    const TIER_ORDER: Record<string, number> = { gold: 3, silver: 2, bronze: 1 };

    return candidates
      .map((c) => ({ ...c, matchScore: scoreCandidate(c, search) }))
      .sort((a, b) => {
        const tierDiff = (TIER_ORDER[b.tier ?? ""] ?? 0) - (TIER_ORDER[a.tier ?? ""] ?? 0);
        return tierDiff !== 0 ? tierDiff : b.matchScore - a.matchScore;
      });
  },
};
