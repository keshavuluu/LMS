import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import {clearWebhooks,stripeWebhooks} from "./controllers/webhooks.js";
import { User } from "./models/User.js";
import educatorRouter from "./routes/educatorRouter.js";
import { clerkMiddleware } from "@clerk/express";
import { connect } from "mongoose";
import connectCloudinary from "./configs/cloudinary.js";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./routes/userRoutes.js";
import fs from "fs";
import courseRouter from "./routes/courseRouter.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set in environment variables");
  process.exit(1);
}

if (!process.env.CLERK_WEBHOOK_SECRET) {
  console.error("CLERK_WEBHOOK_SECRET is not set in environment variables");
  process.exit(1);
}

try {
  await connectDB();
  console.log("Successfully connected to MongoDB");
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

await connectCloudinary();

// Create uploads directory if it doesn't exist

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Configure CORS
app.use(
  cors({
    origin: ["https://clerk.com", "https://clerk.dev", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "svix-id",
      "svix-timestamp",
      "svix-signature",
    ],
  })
);

// Configure Clerk middleware
app.use(clerkMiddleware());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body);
  }
  if (req.file) {
    console.log("File:", req.file);
  }
  next();
});

// Special handling for Clerk webhooks
app.use((req, res, next) => {
  if (req.url === "/clerk" && req.method === "POST") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    next();
  }
});

// Routes
app.get("/", (req, res) => {
  res.json({
    status: "API is working",
    mongodbStatus: "Connected",
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ? "Configured" : "Missing",
  });
});

app.use("/api/educator", educatorRouter);

app.get("/check-users", async (req, res) => {
  try {
    console.log("Checking users in MongoDB...");
    const users = await User.find({}).select("_id name email imageUrl");
    console.log(`Found ${users.length} users:`, JSON.stringify(users, null, 2));
    res.json({
      success: true,
      count: users.length,
      users: users,
    });
  } catch (error) {
    console.error("Error checking users:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post(
  "/clerk",
  async (req, res, next) => {
    console.log("\n=== Clerk Webhook Request Received ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    if (!req.body || typeof req.body !== "string") {
      console.error("Missing raw body");
      return res.status(400).json({ error: "Missing raw body" });
    }

    let body;
    try {
      body = JSON.parse(req.body);
      console.log("Parsed webhook body:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("Error parsing webhook body:", error);
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    req.body = body;
    next();
  },
  clearWebhooks
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("\n=== Error Occurred ===");
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request Method:", req.method);
  console.error("Request Headers:", req.headers);
  console.error("Request Body:", req.body);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});
app.use("/api/course", express.json(), courseRouter);
app.use("/api/user", express.json(), userRouter);
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks);
// Start server
app.listen(port, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${port}`);
  console.log(`Check users endpoint: http://localhost:${port}/check-users`);
  console.log(`Webhook endpoint: http://localhost:${port}/clerk`);
  console.log(`Environment variables configured:`);
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? "Set" : "Missing"}`);
  console.log(
    `- CLERK_WEBHOOK_SECRET: ${
      process.env.CLERK_WEBHOOK_SECRET ? "Set" : "Missing"
    }`
  );
  console.log("=== Ready for requests ===\n");
});
