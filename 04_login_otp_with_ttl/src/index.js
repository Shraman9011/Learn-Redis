import Redis from "ioredis";
import mongoose from "mongoose";
import express from "express";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const BANNER_KEY = "app:banner";

function otpkey(phone) {
  return `otp${phone}`;
}

app.post("/otp", async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const phoneNumber = otpkey(phone);
  // "EX means expiry"

  /* 
  Like EX(expery) you can also pass the values like 
  otp: "057398327",
  attempts:0,
  maxAttempts:3,
  createdAt:timestamp,
  lastAttemptAt:timestamp,
  blockedUntil:timestamp //optional
  */
  const setOTP = await redis.set(phoneNumber, otp, "EX", 60);

  res.json({ message: "OTP sent", otp });
});

app.post("/otp/verify", async (req, res) => {
  const { phone, submitOTP } = req.body;

  const savedOTP = await redis.get(otpkey(phone));

  if (!savedOTP) {
    return res.status(400).json({ message: "OTP is expired or not found" });
  }

  if (savedOTP !== submitOTP) {
    return res.status(400).json({ message: "Invaild OTP" });
  }

  await redis.del(otpkey(phone));
  return res.status(400).json({ message: "OTP verify successfully" });
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const ttl = await redis.ttl(otpkey(req.params.phone));
  res.json({ ttl });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
