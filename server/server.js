import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import clearWebhooks from "./controllers/webhooks.js";

const app = express();

// Check for required environment variables
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set in environment variables");
  process.exit(1);
}

if (!process.env.CLERK_WEBHOOK_SECRET) {
  console.error("CLERK_WEBHOOK_SECRET is not set in environment variables");
  process.exit(1);
}

// Connect to MongoDB
try {
  await connectDB();
  console.log("Successfully connected to MongoDB");
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n=== New Request ===`);
  console.log(`Time: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  console.log(`=== End Request ===\n`);
  next();
});

const port = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("API working"));

// Test endpoint - handle both GET and POST
app
  .route("/test-webhook")
  .get((req, res) => {
    console.log("=== Test Webhook GET ===");
    res.send(`
      <html>
        <body>
          <h1>Webhook Test Page</h1>
          <form action="/test-webhook" method="POST">
            <button type="submit">Send Test Webhook</button>
          </form>
        </body>
      </html>
    `);
  })
  .post((req, res) => {
    console.log("=== Test Webhook POST ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    res.json({
      success: true,
      message: "Test webhook received",
      timestamp: new Date().toISOString(),
    });
  });

// Webhook endpoint
app.post(
  "/clerk",
  express.json(),
  (req, res, next) => {
    console.log("=== Clerk Webhook Received ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
  },
  clearWebhooks
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("=== Server Error ===");
  console.error("Error:", err);
  console.error("Request URL:", req.url);
  console.error("Request Method:", req.method);
  console.error("Request Headers:", req.headers);
  console.error("Request Body:", req.body);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${port}`);
  console.log(`Webhook test endpoint: http://localhost:${port}/test-webhook`);
  console.log(`Clerk webhook endpoint: http://localhost:${port}/clerk`);
  console.log(`=== End Server Info ===\n`);
});
