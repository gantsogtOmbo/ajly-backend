import { t } from "elysia";

export const userModels = {
  createUser: t.Object({
    phone: t.String(),
  }),

  userResponse: t.Object({
    id: t.String(),
    phone: t.String(),
    createdAt: t.Any(),
  }),
};

const ageRangeValues = ["18-24", "25-34", "35-44", "45+"] as const;
const genderValues = ["male", "female", "prefer_not_to_say"] as const;
const currentStatusValues = ["unemployed", "employed_extra", "student", "freelancer"] as const;
const availableFromValues = ["immediate", "week", "month", "later"] as const;
const hoursPerWeekValues = ["10-20", "20-30", "30-40", "40+"] as const;
const contractTypeValues = ["permanent", "temporary", "seasonal", "any"] as const;
const maxCommuteValues = ["15min", "30min", "60min", "any"] as const;
const transportValues = ["own_car", "public", "bicycle", "on_site"] as const;
const yearsExpValues = ["none", "lt1", "1-3", "3+"] as const;
const physicalCapValues = ["full", "light", "none"] as const;
const salaryRangeValues = ["5k-8k", "8k-12k", "12k-18k", "18k+", "negotiable"] as const;
const primaryGoalValues = ["main_income", "extra_income", "gain_experience", "new_industry"] as const;

const lit = <T extends readonly string[]>(vals: T) => t.Union(vals.map((v) => t.Literal(v)) as any);

export const roleModels = {
  setRole: t.Object({
    role: t.Union([t.Literal("job_seeker"), t.Literal("employer")]),
  }),
};

export const personalModels = {
  update: t.Object({
    firstName: t.Optional(t.String({ minLength: 1 })),
    lastName: t.Optional(t.String({ minLength: 1 })),
    birthDate: t.Optional(t.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
  }),
};

export const workExpModels = {
  update: t.Object({
    detail: t.String({ minLength: 10 }),
  }),
};

export const surveyModels = {
  submitStep: t.Object({
    step: t.Number({ minimum: 1, maximum: 5 }),
    ageRange: t.Optional(lit(ageRangeValues)),
    gender: t.Optional(lit(genderValues)),
    currentStatus: t.Optional(lit(currentStatusValues)),
    availableFrom: t.Optional(lit(availableFromValues)),
    hoursPerWeek: t.Optional(lit(hoursPerWeekValues)),
    shifts: t.Optional(t.Array(t.String())),
    contractType: t.Optional(lit(contractTypeValues)),
    maxCommute: t.Optional(lit(maxCommuteValues)),
    transport: t.Optional(lit(transportValues)),
    yearsExperience: t.Optional(lit(yearsExpValues)),
    previousJobTypes: t.Optional(t.Array(t.String())),
    skills: t.Optional(t.Array(t.String())),
    physicalCapability: t.Optional(lit(physicalCapValues)),
    salaryRange: t.Optional(lit(salaryRangeValues)),
    importantCriteria: t.Optional(t.Array(t.String())),
    primaryGoal: t.Optional(lit(primaryGoalValues)),
  }),
};
