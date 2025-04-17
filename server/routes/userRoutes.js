import express from "express";
import {
  getUserData,
  purchaseCourse,
  userEnrolledCourses,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.use(protect);

userRouter.get("/data", getUserData);

userRouter.get("/enrolled-courses", userEnrolledCourses);
userRouter.post("/purchase", purchaseCourse);
export default userRouter;
