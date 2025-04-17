import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addCourse,
  getEducatorCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/educatorController.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Course management routes
router.post("/courses", addCourse);
router.get("/courses", getEducatorCourses);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
