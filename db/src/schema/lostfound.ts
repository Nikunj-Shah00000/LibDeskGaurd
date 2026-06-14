import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lostFoundTable = pgTable("lost_found", {
  id: serial("id").primaryKey(),
  seatId: integer("seat_id").notNull(),
  seatNumber: text("seat_number").notNull(),
  zone: text("zone").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("unclaimed"),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
});

export const insertLostFoundSchema = createInsertSchema(lostFoundTable).omit({ id: true, reportedAt: true, claimedAt: true });
export type InsertLostFound = z.infer<typeof insertLostFoundSchema>;
export type LostFoundItem = typeof lostFoundTable.$inferSelect;
