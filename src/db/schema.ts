import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable(
  "users",
  {
    id: serial("id").primaryKey().unique(),
    phone: text("phone").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => [],
);
