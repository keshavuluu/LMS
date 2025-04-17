import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Purchase } from "../models/Purchase.js";

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("educator", "name imageUrl")
      .sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single course
export const getSingleCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("educator", "name imageUrl")
      .populate("enrolledStudents", "name imageUrl");

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get enrolled courses for a student
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const courses = await Course.find({ enrolledStudents: userId }).populate(
      "educator",
      "name imageUrl"
    );
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course content
export const getCourseContent = async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.auth.userId;

    // Check if user is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.enrolledStudents.includes(userId)) {
      return res
        .status(403)
        .json({ success: false, message: "Not enrolled in this course" });
    }

    res.json({ success: true, content: course.courseContent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Purchase course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth.userId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is already enrolled
    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      courseId,
      userId,
      amount: course.price,
      status: "completed",
    });

    // Add user to enrolled students
    course.enrolledStudents.push(userId);
    await course.save();

    // Add course to user's enrolled courses
    const user = await User.findById(userId);
    user.enrolledCourses.push(courseId);
    await user.save();

    res.json({
      success: true,
      message: "Course purchased successfully",
      purchase,
    });
  } catch (error) {
    console.error("Error in purchaseCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
