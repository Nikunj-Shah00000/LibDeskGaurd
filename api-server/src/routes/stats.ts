import { Router } from "express";
import { db } from "@workspace/db";
import { seatsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const seats = await db.select().from(seatsTable);

    const available = seats.filter((s) => s.status === "available").length;
    const occupied = seats.filter((s) => s.status === "occupied").length;
    const away = seats.filter((s) => s.status === "away").length;
    const abandoned = seats.filter((s) => s.status === "abandoned").length;
    const total = seats.length;
    const occupancyRate = total > 0 ? Math.round(((occupied + away) / total) * 100) : 0;

    const zones = ["A", "B", "C", "D"];
    const zoneBreakdown = zones.map((zone) => {
      const zoneSeats = seats.filter((s) => s.zone === zone);
      return {
        zone,
        available: zoneSeats.filter((s) => s.status === "available").length,
        occupied: zoneSeats.filter((s) => s.status === "occupied").length,
        away: zoneSeats.filter((s) => s.status === "away").length,
        abandoned: zoneSeats.filter((s) => s.status === "abandoned").length,
      };
    });

    const peakHours = [
      { hour: "8am", count: 12 },
      { hour: "9am", count: 28 },
      { hour: "10am", count: 42 },
      { hour: "11am", count: 51 },
      { hour: "12pm", count: 38 },
      { hour: "1pm", count: 44 },
      { hour: "2pm", count: 55 },
      { hour: "3pm", count: 58 },
      { hour: "4pm", count: 48 },
      { hour: "5pm", count: 36 },
      { hour: "6pm", count: 24 },
      { hour: "7pm", count: 30 },
      { hour: "8pm", count: 45 },
      { hour: "9pm", count: 35 },
    ];

    return res.json({
      total,
      available,
      occupied,
      away,
      abandoned,
      occupancyRate,
      peakHours,
      zoneBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Get stats error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
