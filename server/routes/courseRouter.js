import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  getEnrolledCourses,
  purchaseCourse,
  getCourseContent,
} from "../controllers/courseController.js";
import { protect } from "../middlewares/authMiddleware.js";

const courseRouter = express.Router();

// Public routes
courseRouter.get("/all", getAllCourses);
courseRouter.get("/:id", getSingleCourse);

// Protected routes
courseRouter.get("/enrolled", protect, getEnrolledCourses);
courseRouter.post("/purchase", protect, purchaseCourse);
courseRouter.get("/content/:id", protect, getCourseContent);

export default courseRouter;
