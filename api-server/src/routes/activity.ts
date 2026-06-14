import { Router } from "express";
import { db } from "@workspace/db";
import { activityTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/activity", async (req, res) => {
  try {
    const events = await db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.createdAt))
      .limit(20);

    return res.json(
      events.map((e) => ({
        id: e.id,
        seatNumber: e.seatNumber,
        event: e.event,
        student: e.student ?? null,
        type: e.type,
        timestamp: formatTime(e.createdAt),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "List activity error");
    return res.status(500).json({ error: "Internal error" });
  }
});

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export default router;
