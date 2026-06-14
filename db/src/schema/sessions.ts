import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studySessionsTable = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  seatId: integer("seat_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  zone: text("zone").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
  checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
});

export const insertStudySessionSchema = createInsertSchema(studySessionsTable).omit({ id: true });
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessionsTable.$inferSelect;
