import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const occupancyLogsTable = pgTable("occupancy_logs", {
  id: serial("id").primaryKey(),
  hour: integer("hour").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  occupiedCount: integer("occupied_count").notNull(),
  totalSeats: integer("total_seats").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOccupancyLogSchema = createInsertSchema(occupancyLogsTable).omit({ id: true, loggedAt: true });
export type InsertOccupancyLog = z.infer<typeof insertOccupancyLogSchema>;
export type OccupancyLog = typeof occupancyLogsTable.$inferSelect;
