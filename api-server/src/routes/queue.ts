import { Router } from "express";
import { db } from "@workspace/db";
import { seatQueueTable, seatsTable, usersTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

router.post("/queue/join", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const existing = await db.query.seatQueueTable.findFirst({
      where: and(eq(seatQueueTable.userId, userId), eq(seatQueueTable.status, "waiting")),
    });
    if (existing) return res.status(400).json({ error: "Already in queue" });

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    const allWaiting = await db.select().from(seatQueueTable).where(eq(seatQueueTable.status, "waiting"));

    await db.insert(seatQueueTable).values({
      userId,
      studentName: user?.name ?? "Student",
      status: "waiting",
    });

    return res.json({ inQueue: true, position: allWaiting.length + 1, totalWaiting: allWaiting.length + 1, assignedSeat: null, status: "waiting" });
  } catch (err) {
    req.log.error({ err }, "Join queue error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/queue/leave", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await db
      .update(seatQueueTable)
      .set({ status: "cancelled" })
      .where(and(eq(seatQueueTable.userId, userId), eq(seatQueueTable.status, "waiting")));

    return res.json({ message: "Left the queue" });
  } catch (err) {
    req.log.error({ err }, "Leave queue error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/queue/status", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) {
      const allWaiting = await db.select().from(seatQueueTable).where(eq(seatQueueTable.status, "waiting"));
      return res.json({ inQueue: false, position: null, totalWaiting: allWaiting.length, assignedSeat: null, status: null });
    }

    const allWaiting = await db
      .select()
      .from(seatQueueTable)
      .where(eq(seatQueueTable.status, "waiting"))
      .orderBy(asc(seatQueueTable.joinedAt));

    const myEntry = allWaiting.find((e) => e.userId === userId);
    if (!myEntry) {
      const assigned = await db.query.seatQueueTable.findFirst({
        where: and(eq(seatQueueTable.userId, userId), eq(seatQueueTable.status, "assigned")),
      });
      if (assigned) {
        return res.json({
          inQueue: true,
          position: 0,
          totalWaiting: allWaiting.length,
          assignedSeat: assigned.assignedSeatNumber ?? null,
          status: "assigned",
        });
      }
      return res.json({ inQueue: false, position: null, totalWaiting: allWaiting.length, assignedSeat: null, status: null });
    }

    const position = allWaiting.findIndex((e) => e.id === myEntry.id) + 1;
    return res.json({
      inQueue: true,
      position,
      totalWaiting: allWaiting.length,
      assignedSeat: null,
      status: "waiting",
    });
  } catch (err) {
    req.log.error({ err }, "Queue status error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/queue", async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(seatQueueTable)
      .where(eq(seatQueueTable.status, "waiting"))
      .orderBy(asc(seatQueueTable.joinedAt));

    return res.json(
      entries.map((e) => ({
        id: e.id,
        studentName: e.studentName,
        joinedAt: e.joinedAt.toISOString(),
        status: e.status,
        assignedSeatNumber: e.assignedSeatNumber ?? null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "List queue error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
