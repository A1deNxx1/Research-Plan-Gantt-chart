import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const planEdits = sqliteTable("plan_edits", {
  taskId: text("task_id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by").notNull(),
});
