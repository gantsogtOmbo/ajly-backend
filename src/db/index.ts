import { drizzle } from "drizzle-orm/bun-sql";
import env from "../env";
import * as schema from "./schema";

const db = drizzle(env.DATABASE_URL, {
  casing: "snake_case",
  schema,
});

export default db;
