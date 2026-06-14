import { Router } from "express";
import { db } from "@workspace/db";
import { seatsTable, occupancyLogsTable } from "@workspace/db";
import { eq, gte, and } from "drizzle-orm";

const router = Router();

const BASE_OCCUPANCY: Record<number, number> = {
  8: 20, 9: 45, 10: 65, 11: 78, 12: 55, 13: 62, 14: 75, 15: 82,
  16: 70, 17: 55, 18: 40, 19: 50, 20: 65, 21: 52,
};

router.get("/stats/forecast", async (req, res) => {
  try {
    const seats = await db.select().from(seatsTable);
    const total = seats.length || 60;
    const occupied = seats.filter((s) => s.status === "occupied" || s.status === "away").length;
    const currentRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    const currentHour = new Date().getHours();

    const logs = await db
      .select()
      .from(occupancyLogsTable)
      .where(gte(occupancyLogsTable.loggedAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)));

    const forecast = [];
    for (let i = 0; i < 8; i++) {
      const hour = (currentHour + i) % 24;
      const label = hour < 12 ? `${hour === 0 ? 12 : hour}am` : `${hour === 12 ? 12 : hour - 12}pm`;

      const hourLogs = logs.filter((l) => l.hour === hour);
      let predicted: number;
      let confidence: string;

      if (hourLogs.length >= 3) {
        const avg = Math.round(hourLogs.reduce((acc, l) => acc + Math.round((l.occupiedCount / l.totalSeats) * 100), 0) / hourLogs.length);
        if (i === 0) {
          predicted = Math.round((currentRate * 0.4 + avg * 0.6));
        } else {
          predicted = avg;
        }
        confidence = hourLogs.length >= 7 ? "high" : "medium";
      } else {
        const base = BASE_OCCUPANCY[hour] ?? 40;
        if (i === 0) {
          predicted = Math.round((currentRate * 0.6 + base * 0.4));
        } else {
          predicted = base + Math.round((Math.random() - 0.5) * 10);
        }
        confidence = "low";
      }

      predicted = Math.max(5, Math.min(99, predicted));
      forecast.push({ hour, label, predictedOccupancy: predicted, confidence });
    }

    if (total > 0) {
      await db.insert(occupancyLogsTable).values({
        hour: currentHour,
        dayOfWeek: new Date().getDay(),
        occupiedCount: occupied,
        totalSeats: total,
      });
    }

    return res.json(forecast);
  } catch (err) {
    req.log.error({ err }, "Forecast error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
