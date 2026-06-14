import { Router } from "express";
import { db } from "@workspace/db";
import { seatsTable, activityTable, studySessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function seatToApi(seat: typeof seatsTable.$inferSelect) {
  return {
    id: seat.id,
    number: seat.number,
    zone: seat.zone,
    row: seat.row,
    status: seat.status,
    studentName: seat.studentName ?? null,
    checkedInAt: seat.checkedInAt?.toISOString() ?? null,
    lastActivity: seat.lastActivity?.toISOString() ?? null,
    awayEndsAt: seat.awayEndsAt?.toISOString() ?? null,
  };
}

async function logActivity(seatNumber: string, event: string, student: string | null, type: string) {
  await db.insert(activityTable).values({ seatNumber, event, student, type });
}

router.get("/seats", async (req, res) => {
  try {
    const seats = await db.select().from(seatsTable).orderBy(seatsTable.number);
    return res.json(seats.map(seatToApi));
  } catch (err) {
    req.log.error({ err }, "List seats error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/seats/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });
    if (!seat) return res.status(404).json({ error: "Seat not found" });
    return res.json(seatToApi(seat));
  } catch (err) {
    req.log.error({ err }, "Get seat error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/seats/:id/checkin", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });

    if (!seat) return res.status(404).json({ error: "Seat not found" });
    if (seat.status !== "available" && seat.status !== "away" && seat.status !== "abandoned") {
      return res.status(400).json({ error: "Seat not available" });
    }

    const now = new Date();
    const studentName = userId ? "Student" : "Anonymous";

    if (userId && (seat.status === "available" || seat.status === "abandoned")) {
      await db.insert(studySessionsTable).values({
        userId,
        seatId: seat.id,
        seatNumber: seat.number,
        zone: seat.zone,
        checkedInAt: now,
      });
    }

    const [updated] = await db
      .update(seatsTable)
      .set({
        status: "occupied",
        studentId: userId ?? null,
        studentName,
        checkedInAt: now,
        lastActivity: now,
        awayEndsAt: null,
      })
      .where(eq(seatsTable.id, id))
      .returning();

    await logActivity(seat.number, "Checked in", studentName, "occupied");
    return res.json(seatToApi(updated));
  } catch (err) {
    req.log.error({ err }, "Check in error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/seats/:id/away", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });
    if (!seat) return res.status(404).json({ error: "Seat not found" });

    const awayEndsAt = new Date(Date.now() + 20 * 60 * 1000);
    const now = new Date();

    const [updated] = await db
      .update(seatsTable)
      .set({ status: "away", awayEndsAt, lastActivity: now })
      .where(eq(seatsTable.id, id))
      .returning();

    await logActivity(seat.number, "Went away (20 min)", seat.studentName, "away");
    return res.json(seatToApi(updated));
  } catch (err) {
    req.log.error({ err }, "Mark away error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/seats/:id/checkout", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });
    if (!seat) return res.status(404).json({ error: "Seat not found" });

    const now = new Date();

    if (seat.studentId && seat.checkedInAt) {
      const durationMinutes = Math.floor((now.getTime() - seat.checkedInAt.getTime()) / 60000);
      await db
        .update(studySessionsTable)
        .set({ checkedOutAt: now, durationMinutes })
        .where(eq(studySessionsTable.seatId, id));
    }

    const [updated] = await db
      .update(seatsTable)
      .set({
        status: "available",
        studentId: null,
        studentName: null,
        checkedInAt: null,
        lastActivity: now,
        awayEndsAt: null,
      })
      .where(eq(seatsTable.id, id))
      .returning();

    await logActivity(seat.number, "Checked out", seat.studentName, "available");
    return res.json(seatToApi(updated));
  } catch (err) {
    req.log.error({ err }, "Check out error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/seats/:id/release", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });
    if (!seat) return res.status(404).json({ error: "Seat not found" });

    const now = new Date();

    const [updated] = await db
      .update(seatsTable)
      .set({
        status: "available",
        studentId: null,
        studentName: null,
        checkedInAt: null,
        lastActivity: now,
        awayEndsAt: null,
      })
      .where(eq(seatsTable.id, id))
      .returning();

    await logActivity(seat.number, "Force released by admin", seat.studentName, "available");
    return res.json(seatToApi(updated));
  } catch (err) {
    req.log.error({ err }, "Release seat error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
