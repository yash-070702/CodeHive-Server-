const User = require("../models/User.model");
const Question = require("../models/Question.model");
const Answer = require("../models/Answer.model");
const Comment = require("../models/Comments.model");
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and exclude sensitive fields
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch all questions asked by the user
    const questions = await Question.find({ user: userId })
      .populate({
        path: "answers",
        populate: { path: "comments", model: "Comment" }, // Populate comments on answers
      })
      .populate("comments"); // Populate comments on questions

    // Fetch all answers given by the user along with their corresponding questions
    const answers = await Answer.find({ user: userId }).populate("question");

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user,
      questions,
      answers,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteUserAccount = async (req, res) => {
    try {
      const userId = req.user.id; // Authenticated user
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Delete all questions asked by the user
      await Question.deleteMany({ user: userId });
  
      // Delete all answers written by the user
      await Answer.deleteMany({ user: userId });
  
      // Delete all comments made by the user
      await Comment.deleteMany({ user: userId });
  
      // Remove the user from the database
      await User.findByIdAndDelete(userId);
  
      return res.status(200).json({
        success: true,
        message: "User account and all associated data deleted successfully",
      });
  
    } catch (error) {
      console.error("Error deleting user account:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };



 exports.getTopUsersByReputation = async (req, res) => {
      try {
          const topUsers = await User.find({})
              .sort({ reputation: -1 }) // Sort users by highest reputation
              .select('name reputation') // Select only necessary fields
              .limit(10); // Limit to top 10 users (adjust as needed)
  
          res.status(200).json({
              success: true,
              message: "Top users retrieved successfully based on reputation",
              topUsers,
          });
      } catch (error) {
          console.error("Error fetching top users by reputation:", error);
          res.status(500).json({ success: false, message: "Internal Server Error" });
      }
  };
  