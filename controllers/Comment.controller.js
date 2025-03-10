const Comment = require("../models/Comments.model");
const Question = require("../models/Question.model");
const Answer = require("../models/Answer.model");

exports.createComment = async (req, res) => {
  try {
    const { content, parentId, parentType } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    if (!content || !parentId || !parentType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["Question", "Answer"].includes(parentType)) {
      return res.status(400).json({ message: "Invalid parent type" });
    }

    // Create new comment
    const newComment = new Comment({
      content,
      user: userId,
      parentType,
      parentId,
    });

    await newComment.save();

    // Add comment reference to Question or Answer
    if (parentType === "Question") {
      await Question.findByIdAndUpdate(parentId, {
        $push: { comments: newComment._id },
      });
    } else {
      await Answer.findByIdAndUpdate(parentId, {
        $push: { comments: newComment._id },
      });
    }

    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
