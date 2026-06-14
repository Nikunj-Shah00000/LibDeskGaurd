import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const seatQueueTable = pgTable("seat_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  studentName: text("student_name").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  assignedSeatId: integer("assigned_seat_id"),
  assignedSeatNumber: text("assigned_seat_number"),
  status: text("status").notNull().default("waiting"),
});

export const insertQueueSchema = createInsertSchema(seatQueueTable).omit({ id: true, joinedAt: true });
export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type QueueEntry = typeof seatQueueTable.$inferSelect;
