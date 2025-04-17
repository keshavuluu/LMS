import { clerkClient } from "@clerk/express";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({
      success: true,
      message: "You can publish a course now",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addCourse = async (req, res) => {
  try {
    // Log the request data
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    // Check for image file
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "Please upload a course thumbnail image",
      });
    }

    // Check for course data
    if (!req.body.courseData) {
      return res.status(400).json({
        success: false,
        message: "Course data is required",
      });
    }

    const educatorId = req.auth.userId;
    const imageFile = req.files.image;

    // Parse course data
    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(req.body.courseData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid course data format",
      });
    }

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(
      imageFile.tempFilePath
    );

    // Create course
    const newCourse = await Course.create({
      ...parsedCourseData,
      educator: educatorId,
      courseThumbnail: imageUpload.secure_url,
    });

    res.status(201).json({
      success: true,
      message: "Course Added Successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error in addCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEducatorDashboard = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    );
    const enrolledStudentsData = [];

    for (const course of courses) {
      const students = await User.find({
        _id: { $in: course.enrolledStudents },
      }).select("name imageUrl");

      students.forEach((student) => {
        enrolledStudentsData.push({
          courseTitle: course.courseTitle,
          student,
        });
      });
    }

    res.json({
      success: true,
      dashboardData: {
        totalEarnings,
        enrolledStudentsData,
        totalCourses,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map((course) => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const educatorId = req.auth.userId;

    // Find the course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the educator owns this course
    if (course.educator.toString() !== educatorId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const educatorId = req.auth.userId;
    const updates = req.body;

    // Find the course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the educator owns this course
    if (course.educator.toString() !== educatorId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this course",
      });
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error in updateCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
