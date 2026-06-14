import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const seatsTable = pgTable("seats", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  zone: text("zone").notNull(),
  row: integer("row").notNull(),
  status: text("status").notNull().default("available"),
  studentId: integer("student_id"),
  studentName: text("student_name"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  lastActivity: timestamp("last_activity", { withTimezone: true }),
  awayEndsAt: timestamp("away_ends_at", { withTimezone: true }),
});

export const insertSeatSchema = createInsertSchema(seatsTable).omit({ id: true });
export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type Seat = typeof seatsTable.$inferSelect;
