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
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Authenticated user

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Ensure only the owner can edit the comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You can only edit your own comment" });
    }

    // Update comment text
    comment.content = content;
    comment.updatedAt = Date.now();

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id; // Authenticated user

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    let parentModel;
    if (comment.parentType === 'Question') {
      parentModel = Question;
    } else if (comment.parentType === 'Answer') {
      parentModel = Answer;
    }

    const parent = await parentModel.findById(comment.parentId);
    if (!parent) {
      return res.status(404).json({ success: false, message: `${comment.parentType} not found` });
    }

    // Check if the user is authorized to delete the comment
    if (
      comment.user.toString() !== userId && // Comment owner
      parent.user.toString() !== userId // Question or Answer owner
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    // Remove comment from the parent (Question or Answer)
    parent.comments = parent.comments.filter(id => id.toString() !== commentId);
    await parent.save();

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};