import { Router } from "express";
import { db } from "@workspace/db";
import { seatsTable } from "@workspace/db";

const router = Router();

router.get("/seats/recommend", async (req, res) => {
  try {
    const quietZone = req.query.quietZone === "true";
    const needsPower = req.query.needsPower === "true";
    const groupSize = Number(req.query.groupSize) || 1;
    const preferredZone = req.query.zone as string | undefined;

    const seats = await db.select().from(seatsTable).orderBy(seatsTable.number);
    const available = seats.filter((s) => s.status === "available" || s.status === "away");

    if (available.length === 0) {
      return res.status(404).json({ error: "No seats available" });
    }

    const ZONE_FEATURES: Record<string, { quiet: boolean; power: boolean; group: boolean }> = {
      A: { quiet: true, power: true, group: false },
      B: { quiet: false, power: true, group: true },
      C: { quiet: true, power: false, group: false },
      D: { quiet: false, power: false, group: true },
    };

    const scored = available.map((seat) => {
      let score = 50;
      const features = ZONE_FEATURES[seat.zone] ?? { quiet: false, power: false, group: false };
      const reasons: string[] = [];

      if (quietZone && features.quiet) {
        score += 20;
        reasons.push("Quiet study zone");
      } else if (quietZone && !features.quiet) {
        score -= 15;
      }

      if (needsPower && features.power) {
        score += 20;
        reasons.push("Power outlets available");
      } else if (needsPower && !features.power) {
        score -= 15;
      }

      if (groupSize > 1 && features.group) {
        score += 15;
        reasons.push("Good for group study");
      } else if (groupSize === 1 && !features.group) {
        score += 10;
        reasons.push("Solo-study friendly");
      }

      if (preferredZone && seat.zone === preferredZone) {
        score += 25;
        reasons.push(`Zone ${seat.zone} preference match`);
      }

      if (seat.status === "available") {
        score += 10;
        reasons.push("Currently free");
      }

      const lowRow = seat.row <= 2;
      if (lowRow) {
        score += 5;
        reasons.push("Convenient row");
      }

      if (reasons.length === 0) reasons.push("Available seat");

      return {
        seat: {
          id: seat.id,
          number: seat.number,
          zone: seat.zone,
          row: seat.row,
          status: seat.status,
          studentName: seat.studentName ?? null,
          checkedInAt: seat.checkedInAt?.toISOString() ?? null,
          lastActivity: seat.lastActivity?.toISOString() ?? null,
          awayEndsAt: seat.awayEndsAt?.toISOString() ?? null,
        },
        score,
        reasons,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return res.json(scored[0]);
  } catch (err) {
    req.log.error({ err }, "Recommend seat error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
