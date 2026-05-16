import Redis from "ioredis";
import mongoose from "mongoose";
import express from "express";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const BANNER_KEY = "app:banner";

app.post("/banner", async (req, res) => {
  await redis.set(
    BANNER_KEY,
    req.body?.message || `Welcome to Redis!${req.body?.message}`,
  );
  res.json({ success: true });
});

app.get("/banner", async (req, res) => {
  const message = await redis.get(BANNER_KEY);
  res.json({ message });
});

app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);
  res.json({ success: true });
});

app.get("/banner/exists", async (req, res) => {
  const exist = await redis.exists(BANNER_KEY);
  res.json({ exist: exist });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
