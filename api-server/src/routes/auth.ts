import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEMO_PASSWORD = "demo1234";

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password !== DEMO_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return res.status(401).json({ error: "No account found for that email" });
    }

    (req.session as Record<string, unknown>).userId = user.id;

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session = null as unknown as typeof req.session;
  return res.json({ message: "Logged out" });
});

router.get("/auth/me", async (req, res) => {
  try {
    const userId = (req.session as Record<string, unknown>)?.userId as number | undefined;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) return res.status(401).json({ error: "User not found" });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    req.log.error({ err }, "GetMe error");
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
