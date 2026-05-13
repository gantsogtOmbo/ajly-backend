import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["job_seeker", "employer"]);

export const tierEnum = pgEnum("tier", ["bronze", "silver", "gold"]);

export const ageRangeEnum = pgEnum("age_range", ["18-24", "25-34", "35-44", "45+"]);

export const genderEnum = pgEnum("gender", ["male", "female", "prefer_not_to_say"]);

export const currentStatusEnum = pgEnum("current_status", [
  "unemployed", // Ажилгүй, бүтэн цагаар хайж байна
  "employed_extra", // Ажилтай, нэмэлт орлого хайж байна
  "student", // Оюутан, хагас цагаар
  "freelancer", // Чөлөөт ажилтан
]);

export const availableFromEnum = pgEnum("available_from", [
  "immediate", // Шууд (өнөөдөр / маргааш)
  "week", // 7 хоногийн дотор
  "month", // 1 сарын дотор
  "later", // 1 сараас дараа
]);

export const hoursPerWeekEnum = pgEnum("hours_per_week", [
  "10-20", // Хагас цаг
  "20-30",
  "30-40", // Бүтэн цаг
  "40+", // Илүү цаг хийхэд бэлэн
]);

export const contractTypeEnum = pgEnum("contract_type", [
  "permanent", // Байнгын орон тоо
  "temporary", // Түр (3–6 сар)
  "seasonal", // Улирлын / Төсөл
  "any", // Ямар ч байсан
]);

export const maxCommuteEnum = pgEnum("max_commute", [
  "15min", // 15 минутын дотор
  "30min", // 30 минутын дотор
  "60min", // 1 цагийн дотор
  "any", // Хамаагүй / нүүж ирэхэд бэлэн
]);

export const transportEnum = pgEnum("transport", [
  "own_car", // Өөрийн машин
  "public", // Нийтийн тээвэр
  "bicycle", // Дугуй / явган
  "on_site", // Ажил дээрээ байрладаг
]);

export const yearsExpEnum = pgEnum("years_experience", [
  "none", // Туршлагагүй
  "lt1", // 1 жил хүртэл
  "1-3", // 1–3 жил
  "3+", // 3+ жил
]);

export const physicalCapEnum = pgEnum("physical_capability", [
  "full", // Тийм — хүнд зүйл өргөх, удаан зогсох
  "light", // Дундаж — хөнгөн физик ажил
  "none", // Үгүй — суугаа / дотоод ажил
]);

export const salaryRangeEnum = pgEnum("salary_range", [
  "5k-8k", // 5,000–8,000 ₮/цаг
  "8k-12k", // 8,000–12,000 ₮/цаг
  "12k-18k", // 12,000–18,000 ₮/цаг
  "18k+", // 18,000+ ₮/цаг
  "negotiable", // Хэлэлцэж тохирно
]);

export const primaryGoalEnum = pgEnum("primary_goal", [
  "main_income", // Үндсэн орлого
  "extra_income", // Нэмэлт орлого
  "gain_experience", // Туршлага хуримтлуулах
  "new_industry", // Шинэ салбарт орох
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  phone: text("phone").unique(),
  role: roleEnum("role"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  birthDate: text("birth_date"), // "YYYY-MM-DD"
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  surveyStep: integer("survey_step").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSurveys = pgTable(
  "user_surveys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    ageRange: ageRangeEnum("age_range"),
    gender: genderEnum("gender"),
    currentStatus: currentStatusEnum("current_status"),

    availableFrom: availableFromEnum("available_from"),
    hoursPerWeek: hoursPerWeekEnum("hours_per_week"),
    shifts: text("shifts").array(),
    contractType: contractTypeEnum("contract_type"),

    maxCommute: maxCommuteEnum("max_commute"),
    transport: transportEnum("transport"),

    yearsExperience: yearsExpEnum("years_experience"),
    previousJobTypes: text("previous_job_types").array(),
    skills: text("skills").array(),
    physicalCapability: physicalCapEnum("physical_capability"),

    salaryRange: salaryRangeEnum("salary_range"),
    importantCriteria: text("important_criteria").array(),
    primaryGoal: primaryGoalEnum("primary_goal"),

    // Tier system
    tier: tierEnum("tier"),
    workExperienceDetail: text("work_experience_detail"),
    bronzeAt: timestamp("bronze_at"),
    silverAt: timestamp("silver_at"),
    goldAt: timestamp("gold_at"),

    answeredCount: integer("answered_count").default(0).notNull(),
    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },

  (t) => ({
    availableFromIdx: index("idx_sv_available_from").on(t.availableFrom),
    contractTypeIdx: index("idx_sv_contract_type").on(t.contractType),
    maxCommuteIdx: index("idx_sv_max_commute").on(t.maxCommute),
    physicalCapIdx: index("idx_sv_physical_cap").on(t.physicalCapability),
    salaryRangeIdx: index("idx_sv_salary_range").on(t.salaryRange),
    currentStatusIdx: index("idx_sv_current_status").on(t.currentStatus),
    yearsExpIdx: index("idx_sv_years_exp").on(t.yearsExperience),
    primaryGoalIdx: index("idx_sv_primary_goal").on(t.primaryGoal),
    tierIdx: index("idx_sv_tier").on(t.tier),

    shiftsGinIdx: index("idx_sv_shifts_gin").using("gin", t.shifts),
    jobTypesGinIdx: index("idx_sv_job_types_gin").using("gin", t.previousJobTypes),
    skillsGinIdx: index("idx_sv_skills_gin").using("gin", t.skills),
    criteriaGinIdx: index("idx_sv_criteria_gin").using("gin", t.importantCriteria),

    mainFilterIdx: index("idx_sv_main_filter").on(t.availableFrom, t.physicalCapability, t.salaryRange, t.contractType),
    tierFilterIdx: index("idx_sv_tier_filter").on(t.tier, t.availableFrom, t.salaryRange),
  }),
);

export const employerProfiles = pgTable("employer_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employerSearches = pgTable("employer_searches", {
  id: text("id").primaryKey(),
  employerId: text("employer_id")
    .notNull()
    .references(() => employerProfiles.id, { onDelete: "cascade" }),
  name: text("name"),

  // Filters (null = any)
  requiredAvailability: availableFromEnum("required_availability"),
  requiredHours: hoursPerWeekEnum("required_hours"),
  requiredShifts: text("required_shifts").array(),
  requiredContract: contractTypeEnum("required_contract"),
  requiredJobTypes: text("required_job_types").array(),
  requiredSkills: text("required_skills").array(),
  requiredPhysical: physicalCapEnum("required_physical"),
  offeredSalary: salaryRangeEnum("offered_salary"),

  // Custom weights (0–100)
  weightAvailability: integer("weight_availability").default(15).notNull(),
  weightHours: integer("weight_hours").default(10).notNull(),
  weightContract: integer("weight_contract").default(20).notNull(),
  weightPhysical: integer("weight_physical").default(15).notNull(),
  weightSkills: integer("weight_skills").default(15).notNull(),
  weightSalary: integer("weight_salary").default(25).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
