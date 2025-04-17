import express from "express";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("=== Request Received ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("=====================");
  next();
});

app.get("/test", (req, res) => {
  console.log("Test endpoint hit!");
  res.json({ message: "Test successful!" });
});

app.listen(port, () => {
  console.log(`\n=== Test Server Started ===`);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Test endpoint: http://localhost:${port}/test`);
  console.log(`=== End Server Info ===\n`);
});