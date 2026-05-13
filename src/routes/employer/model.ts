import { t } from "elysia";

const availableFromVals = ["immediate", "week", "month", "later"] as const;
const hoursPerWeekVals = ["10-20", "20-30", "30-40", "40+"] as const;
const contractTypeVals = ["permanent", "temporary", "seasonal", "any"] as const;
const physicalCapVals = ["full", "light", "none"] as const;
const salaryRangeVals = ["5k-8k", "8k-12k", "12k-18k", "18k+", "negotiable"] as const;

const lit = <T extends readonly string[]>(vals: T) =>
  t.Union(vals.map((v) => t.Literal(v)) as any);

export const employerModels = {
  upsertProfile: t.Object({
    companyName: t.Optional(t.String()),
  }),

  createSearch: t.Object({
    name: t.Optional(t.String()),
    requiredAvailability: t.Optional(lit(availableFromVals)),
    requiredHours: t.Optional(lit(hoursPerWeekVals)),
    requiredShifts: t.Optional(t.Array(t.String())),
    requiredContract: t.Optional(lit(contractTypeVals)),
    requiredJobTypes: t.Optional(t.Array(t.String())),
    requiredSkills: t.Optional(t.Array(t.String())),
    requiredPhysical: t.Optional(lit(physicalCapVals)),
    offeredSalary: t.Optional(lit(salaryRangeVals)),
    weightAvailability: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    weightHours: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    weightContract: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    weightPhysical: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    weightSkills: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    weightSalary: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
  }),
};
