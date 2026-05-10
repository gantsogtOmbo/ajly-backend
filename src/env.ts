import z from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
});

export type env = z.infer<typeof envSchema>;

let env: env;

const { success, data, error } = envSchema.safeParse(Bun.env);

if (success) {
  env = data;
} else {
  console.error(error);
  process.exit(1);
}

export default env;
