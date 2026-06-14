import { Router } from "express";
import { db } from "@workspace/db";
import { lostFoundTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/lost-found", async (req, res) => {
  try {
    const items = await db.select().from(lostFoundTable).orderBy(desc(lostFoundTable.reportedAt)).limit(50);
    return res.json(
      items.map((item) => ({
        id: item.id,
        seatNumber: item.seatNumber,
        zone: item.zone,
        description: item.description,
        status: item.status,
        reportedAt: item.reportedAt.toISOString(),
        claimedAt: item.claimedAt?.toISOString() ?? null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "List lost found error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/lost-found", async (req, res) => {
  try {
    const { seatId, seatNumber, zone, description } = req.body as {
      seatId: number;
      seatNumber: string;
      zone: string;
      description: string;
    };

    if (!seatNumber || !zone || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [item] = await db
      .insert(lostFoundTable)
      .values({ seatId: seatId ?? 0, seatNumber, zone, description, status: "unclaimed" })
      .returning();

    return res.status(201).json({
      id: item.id,
      seatNumber: item.seatNumber,
      zone: item.zone,
      description: item.description,
      status: item.status,
      reportedAt: item.reportedAt.toISOString(),
      claimedAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "Report lost found error");
    return res.status(500).json({ error: "Internal error" });
  }
});

router.patch("/lost-found/:id/claim", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [item] = await db
      .update(lostFoundTable)
      .set({ status: "claimed", claimedAt: new Date() })
      .where(eq(lostFoundTable.id, id))
      .returning();

    if (!item) return res.status(404).json({ error: "Item not found" });
    return res.json({
      id: item.id,
      seatNumber: item.seatNumber,
      zone: item.zone,
      description: item.description,
      status: item.status,
      reportedAt: item.reportedAt.toISOString(),
      claimedAt: item.claimedAt?.toISOString() ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Claim lost found error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
