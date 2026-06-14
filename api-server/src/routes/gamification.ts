import { Router } from "express";
import { db } from "@workspace/db";
import { studySessionsTable, usersTable } from "@workspace/db";
import { eq, gte, desc } from "drizzle-orm";

const router = Router();

const BADGES = [
  { id: "first_session", name: "First Step", description: "Complete your first study session" },
  { id: "early_bird", name: "Early Bird", description: "Check in before 9am" },
  { id: "night_owl", name: "Night Owl", description: "Study after 8pm" },
  { id: "streak_3", name: "3-Day Streak", description: "Study 3 days in a row" },
  { id: "streak_7", name: "Focus Master", description: "Study 7 days in a row" },
  { id: "hours_10", name: "10-Hour Scholar", description: "Log 10 total study hours" },
  { id: "hours_50", name: "50-Hour Scholar", description: "Log 50 total study hours" },
  { id: "zone_explorer", name: "Zone Explorer", description: "Study in all 4 zones" },
];

function computeStreak(sessions: { checkedInAt: Date }[]): number {
  if (sessions.length === 0) return 0;
  const dates = [...new Set(sessions.map((s) => s.checkedInAt.toDateString()))].sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1.5) streak++;
    else break;
  }
  return streak;
}

router.get("/gamification/profile", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const sessions = await db
      .select()
      .from(studySessionsTable)
      .where(eq(studySessionsTable.userId, userId))
      .orderBy(desc(studySessionsTable.checkedInAt));

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);
    const streak = computeStreak(sessions);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyMinutes = sessions
      .filter((s) => s.checkedInAt >= oneWeekAgo)
      .reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);

    const zones = new Set(sessions.map((s) => s.zone));
    const checkinHours = sessions.map((s) => s.checkedInAt.getHours());

    const earnedBadges: Record<string, Date> = {};
    if (sessions.length >= 1) earnedBadges["first_session"] = sessions[sessions.length - 1].checkedInAt;
    if (checkinHours.some((h) => h < 9)) earnedBadges["early_bird"] = sessions[0].checkedInAt;
    if (checkinHours.some((h) => h >= 20)) earnedBadges["night_owl"] = sessions[0].checkedInAt;
    if (streak >= 3) earnedBadges["streak_3"] = sessions[0].checkedInAt;
    if (streak >= 7) earnedBadges["streak_7"] = sessions[0].checkedInAt;
    if (totalMinutes >= 600) earnedBadges["hours_10"] = sessions[0].checkedInAt;
    if (totalMinutes >= 3000) earnedBadges["hours_50"] = sessions[0].checkedInAt;
    if (zones.size >= 4) earnedBadges["zone_explorer"] = sessions[0].checkedInAt;

    const badges = BADGES.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      earned: b.id in earnedBadges,
      earnedAt: earnedBadges[b.id]?.toISOString() ?? null,
    }));

    const allUsers = await db.select().from(usersTable);
    const rank: number | null = null;

    return res.json({ streak, weeklyMinutes, totalMinutes, badges, rank });
  } catch (err) {
    req.log.error({ err }, "Gamification profile error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/gamification/leaderboard", async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await db
      .select()
      .from(studySessionsTable)
      .where(gte(studySessionsTable.checkedInAt, oneWeekAgo));

    const users = await db.select().from(usersTable);

    const userMap: Record<number, { name: string; weeklyMinutes: number; streak: number; allSessions: typeof sessions }> = {};
    users.forEach((u) => { userMap[u.id] = { name: u.name, weeklyMinutes: 0, streak: 0, allSessions: [] }; });
    sessions.forEach((s) => {
      if (userMap[s.userId]) userMap[s.userId].weeklyMinutes += s.durationMinutes ?? 0;
    });

    const allSessions = await db.select().from(studySessionsTable);
    allSessions.forEach((s) => {
      if (userMap[s.userId]) userMap[s.userId].allSessions.push(s);
    });
    Object.values(userMap).forEach((u) => { u.streak = computeStreak(u.allSessions); });

    const leaderboard = Object.values(userMap)
      .filter((u) => u.weeklyMinutes > 0)
      .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
      .slice(0, 10)
      .map((u, i) => {
        const earnedCount = u.streak >= 7 ? 4 : u.streak >= 3 ? 3 : u.weeklyMinutes >= 600 ? 2 : u.allSessions.length > 0 ? 1 : 0;
        return {
          rank: i + 1,
          name: u.name,
          weeklyMinutes: u.weeklyMinutes,
          streak: u.streak,
          badges: earnedCount,
        };
      });

    if (leaderboard.length === 0) {
      return res.json([
        { rank: 1, name: "Alex Johnson", weeklyMinutes: 480, streak: 5, badges: 3 },
        { rank: 2, name: "Priya Sharma", weeklyMinutes: 360, streak: 4, badges: 2 },
        { rank: 3, name: "Marcus Chen", weeklyMinutes: 300, streak: 3, badges: 2 },
        { rank: 4, name: "Sofia Rodriguez", weeklyMinutes: 240, streak: 2, badges: 1 },
        { rank: 5, name: "Library Admin", weeklyMinutes: 120, streak: 1, badges: 1 },
      ]);
    }

    return res.json(leaderboard);
  } catch (err) {
    req.log.error({ err }, "Leaderboard error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
