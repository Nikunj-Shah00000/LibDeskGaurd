import { db, pool } from "@workspace/db";
import {
  seatsTable,
  usersTable,
  studySessionsTable,
  noiseReportsTable,
  occupancyLogsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const ZONES = ["A", "B", "C", "D"] as const;
const SEATS_PER_ZONE = 15;

const DEMO_USERS = [
  { name: "Admin User",     email: "admin@library.edu",   role: "admin"   },
  { name: "Alice Chen",     email: "alice@library.edu",    role: "student" },
  { name: "Ben Okafor",     email: "ben@library.edu",      role: "student" },
  { name: "Clara Santos",   email: "clara@library.edu",    role: "student" },
  { name: "David Kim",      email: "david@library.edu",    role: "student" },
  { name: "Esther Müller",  email: "esther@library.edu",   role: "student" },
  { name: "Frank Nguyen",   email: "frank@library.edu",    role: "student" },
  { name: "Grace Patel",    email: "grace@library.edu",    role: "student" },
  { name: "Hiroshi Tanaka", email: "hiroshi@library.edu",  role: "student" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

async function seed() {
  console.log("🌱  Starting DeskGuard seed…\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("👤  Seeding users…");
  const insertedUsers: { id: number; name: string; email: string }[] = [];
  for (const u of DEMO_USERS) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email))
      .limit(1);
    if (existing.length > 0) {
      insertedUsers.push(existing[0]);
      console.log(`   skip ${u.email} (already exists)`);
    } else {
      const [row] = await db.insert(usersTable).values(u).returning();
      insertedUsers.push(row);
      console.log(`   + ${u.name} (${u.role})`);
    }
  }
  const students = insertedUsers.filter((_, i) => i > 0); // skip admin

  // ── 2. Seats ──────────────────────────────────────────────────────────────
  console.log("\n🪑  Seeding seats…");

  // Status distribution: ~45% available, ~35% occupied, ~12% away, ~8% abandoned
  const statusPool = [
    ...Array(45).fill("available"),
    ...Array(35).fill("occupied"),
    ...Array(12).fill("away"),
    ...Array(8).fill("abandoned"),
  ];

  const insertedSeats: { id: number; number: string; zone: string; row: number }[] = [];

  for (const zone of ZONES) {
    for (let i = 1; i <= SEATS_PER_ZONE; i++) {
      const num = `${zone}${String(i).padStart(2, "0")}`;
      const seatRow = Math.ceil(i / 5);
      const status = pick(statusPool);
      const student = status !== "available" ? pick(students) : null;

      const checkedInAt =
        status === "occupied" || status === "away" || status === "abandoned"
          ? hoursAgo(randomBetween(1, 4))
          : null;

      const awayEndsAt =
        status === "away"
          ? new Date(Date.now() + randomBetween(5, 25) * 60 * 1000)
          : null;

      const lastActivity =
        status === "abandoned"
          ? hoursAgo(randomBetween(2, 5))
          : checkedInAt;

      const existing = await db
        .select()
        .from(seatsTable)
        .where(eq(seatsTable.number, num))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(seatsTable)
          .set({
            status,
            studentId: student?.id ?? null,
            studentName: student?.name ?? null,
            checkedInAt,
            awayEndsAt,
            lastActivity,
          })
          .where(eq(seatsTable.number, num));
        insertedSeats.push(existing[0]);
      } else {
        const [newSeat] = await db
          .insert(seatsTable)
          .values({
            number: num,
            zone,
            row: seatRow,
            status,
            studentId: student?.id ?? null,
            studentName: student?.name ?? null,
            checkedInAt,
            awayEndsAt,
            lastActivity,
          })
          .returning();
        insertedSeats.push(newSeat);
      }
    }
    console.log(`   Zone ${zone}: ${SEATS_PER_ZONE} seats`);
  }

  // ── 3. Study sessions (historical — last 14 days) ─────────────────────────
  console.log("\n📚  Seeding historical study sessions…");
  let sessionCount = 0;

  for (const student of students) {
    const numDays = randomBetween(4, 14);
    for (let d = 0; d < numDays; d++) {
      const seat = pick(insertedSeats);
      const durationMins = randomBetween(45, 240);
      const base = daysAgo(d);
      base.setHours(randomBetween(8, 20), randomBetween(0, 59), 0, 0);
      const end = new Date(base.getTime() + durationMins * 60 * 1000);

      await db.insert(studySessionsTable).values({
        userId: student.id,
        seatId: seat.id,
        seatNumber: seat.number,
        zone: seat.zone,
        checkedInAt: base,
        checkedOutAt: end,
        durationMinutes: durationMins,
      });
      sessionCount++;
    }
  }
  console.log(`   ${sessionCount} sessions across last 14 days`);

  // ── 4. Noise reports (fresh — last 20 minutes for heatmap) ────────────────
  console.log("\n🔊  Seeding noise reports…");
  const zoneNoiseBias: Record<string, ("quiet" | "moderate" | "noisy")[]> = {
    A: ["quiet", "quiet", "quiet", "moderate"],
    B: ["moderate", "noisy", "noisy", "moderate"],
    C: ["quiet", "quiet", "moderate"],
    D: ["moderate", "noisy", "noisy", "noisy"],
  };

  for (const zone of ZONES) {
    const bias = zoneNoiseBias[zone];
    const zoneSeats = insertedSeats.filter((s) => s.zone === zone);
    for (let n = 0; n < randomBetween(4, 8); n++) {
      const seat = pick(zoneSeats);
      const level = pick(bias);
      await db.insert(noiseReportsTable).values({
        seatId: seat.id,
        seatNumber: seat.number,
        zone,
        level,
        reportedAt: new Date(Date.now() - randomBetween(0, 18) * 60 * 1000),
      });
    }
    console.log(`   Zone ${zone}: noise biased "${zoneNoiseBias[zone][0]}"`);
  }

  // ── 5. Occupancy logs (last 8 hours — for forecast chart) ─────────────────
  console.log("\n📈  Seeding occupancy logs…");
  const totalSeats = ZONES.length * SEATS_PER_ZONE;
  let logCount = 0;

  for (let h = 8; h >= 0; h--) {
    const logTime = hoursAgo(h);
    const hourOfDay = logTime.getHours();
    const dayOfWeek = logTime.getDay();
    // Simulate a bell curve: low early morning, peak midday, drop evening
    const peakFactor = Math.sin(((hourOfDay - 8) / 12) * Math.PI);
    const baseCount = Math.max(2, Math.round(peakFactor * 42 + randomBetween(-4, 4)));
    const occupiedCount = Math.min(totalSeats, Math.max(1, baseCount));

    await db.insert(occupancyLogsTable).values({
      hour: hourOfDay,
      dayOfWeek,
      occupiedCount,
      totalSeats,
    });
    logCount++;
  }
  console.log(`   ${logCount} hourly snapshots`);

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!");
  console.log(`   ${insertedUsers.length} users  |  ${insertedSeats.length} seats  |  ${sessionCount} sessions\n`);
  console.log("🔑  Demo logins (use any email + password: demo1234):");
  for (const u of DEMO_USERS) {
    console.log(`   ${u.email.padEnd(28)} (${u.role})`);
  }
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
