import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const noiseReportsTable = pgTable("noise_reports", {
  id: serial("id").primaryKey(),
  seatId: integer("seat_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  zone: text("zone").notNull(),
  level: text("level").notNull(),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNoiseReportSchema = createInsertSchema(noiseReportsTable).omit({ id: true, reportedAt: true });
export type InsertNoiseReport = z.infer<typeof insertNoiseReportSchema>;
export type NoiseReport = typeof noiseReportsTable.$inferSelect;
