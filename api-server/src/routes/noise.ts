import { Router } from "express";
import { db } from "@workspace/db";
import { seatsTable, noiseReportsTable } from "@workspace/db";
import { eq, gte, desc } from "drizzle-orm";

const router = Router();

router.post("/seats/:id/noise", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { level } = req.body as { level: string };

    if (!["quiet", "moderate", "noisy"].includes(level)) {
      return res.status(400).json({ error: "Invalid noise level" });
    }

    const seat = await db.query.seatsTable.findFirst({ where: eq(seatsTable.id, id) });
    if (!seat) return res.status(404).json({ error: "Seat not found" });

    await db.insert(noiseReportsTable).values({
      seatId: seat.id,
      seatNumber: seat.number,
      zone: seat.zone,
      level,
    });

    return res.json({ message: "Noise level reported" });
  } catch (err) {
    req.log.error({ err }, "Report noise error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/noise/heatmap", async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const reports = await db
      .select()
      .from(noiseReportsTable)
      .where(gte(noiseReportsTable.reportedAt, thirtyMinutesAgo))
      .orderBy(desc(noiseReportsTable.reportedAt));

    const zones = ["A", "B", "C", "D"];
    const heatmap = zones.map((zone) => {
      const zoneReports = reports.filter((r) => r.zone === zone);
      if (zoneReports.length === 0) {
        return { zone, level: "unknown", reportCount: 0, lastUpdated: null };
      }
      const counts = { quiet: 0, moderate: 0, noisy: 0 };
      zoneReports.forEach((r) => {
        const l = r.level as keyof typeof counts;
        if (l in counts) counts[l]++;
      });
      const level = (["noisy", "moderate", "quiet"] as const).find((l) => counts[l] > 0) ?? "unknown";
      const dominant = (["noisy", "moderate", "quiet"] as const).reduce((a, b) => counts[a] >= counts[b] ? a : b);
      return {
        zone,
        level: dominant,
        reportCount: zoneReports.length,
        lastUpdated: zoneReports[0]?.reportedAt?.toISOString() ?? null,
      };
    });

    return res.json(heatmap);
  } catch (err) {
    req.log.error({ err }, "Get noise heatmap error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
