import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, studySessionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/profile", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    const sessions = await db
      .select()
      .from(studySessionsTable)
      .where(eq(studySessionsTable.userId, userId))
      .orderBy(desc(studySessionsTable.checkedInAt))
      .limit(10);

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);
    const totalHours = totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : `${totalMinutes}m`;

    const zoneCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      zoneCounts[s.zone] = (zoneCounts[s.zone] ?? 0) + 1;
    });
    const favoriteZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const recentSessions = sessions.map((s) => ({
      id: s.id,
      date: formatDate(s.checkedInAt),
      seatNumber: s.seatNumber,
      zone: s.zone,
      duration: s.durationMinutes
        ? s.durationMinutes >= 60
          ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`
          : `${s.durationMinutes}m`
        : "In progress",
    }));

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      totalSessions,
      totalHours,
      favoriteZone,
      recentSessions,
    });
  } catch (err) {
    req.log.error({ err }, "Get profile error");
    return res.status(500).json({ error: "Internal error" });
  }
});

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return names[date.getDay()];
  }
  return date.toLocaleDateString();
}

export default router;
