import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Get the user ID from the request headers
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user ID provided",
      });
    }

    // Find the user in the database
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
    }

    // Check if user is an educator
    if (!user.isEducator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized, user is not an educator",
      });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
