const Question = require("../models/Question.model");
const Answer = require("../models/Answer.model");
const User = require("../models/User.model");
const { updateUserReputation } = require("../utils/reputationUpdate");
const Comment = require("../models/Comments.model");
exports.createAnswer = async (req, res) => {
  try {
    const { questionId, content } = req.body;
    const userId = req.user.id; // Extract user ID from the request object

    if (!questionId || !content) {
      return res.status(400).json({
        success: false,
        message: "Question ID and content are required",
      });
    }

    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Prevent the question owner from answering their own question
    if (question.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot answer your own question.",
      });
    }

    // Create a new answer
    const answer = new Answer({
      content,
      user: userId,
      question: questionId,
    });

    await answer.save();

    // Add answer reference to the Question
    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: answer._id },
    });

    // Add answer reference to the User
    await User.findByIdAndUpdate(userId, { $push: { answers: answer._id } });

    // The user who answered gets +15 reputation
    await updateUserReputation(userId, "answerAccepted");

    //The question owner gets +1 reputation
    await updateUserReputation(question.user, "newAnswer");

    return res.status(201).json({
      success: true,
      message: "Answer submitted successfully",
      answer,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.editAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Assuming authentication middleware

    // Validate content
    if (!content || content.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Answer content cannot be empty" });
    }

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    // Check if the logged-in user is the owner of the answer
    if (answer.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own answers",
      });
    }

    // Update answer content
    answer.content = content;
    answer.updatedAt = Date.now();
    await answer.save();

    return res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      answer,
    });
  } catch (error) {
    console.error("Error editing answer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.deleteAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const userId = req.user.id; // Authenticated user ID

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    // Find the question related to this answer
    const question = await Question.findById(answer.question);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Related question not found" });
    }

    // Check if the user is either the **answer owner** or **question owner**
    if (
      answer.user.toString() !== userId &&
      question.user.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this answer",
      });
    }

    // Handle reputation updates
    await updateUserReputation(answer.user, "answerDeleted"); // Answer owner loses -15
    await updateUserReputation(question.user, "answerRemovedFromQuestion"); // Question owner loses -1

    // Handle upvote reputation rollback
    if (answer.upvotes.length > 0) {
      for (const upvoterId of answer.upvotes) {
        await updateUserReputation(upvoterId, "removeUpvote"); // Upvoters get back +10 each
      }
    }

    // Delete all comments on this answer
    await Comment.deleteMany({ answer: answerId });

    // Remove the answer from the question's answers array
    await Question.findByIdAndUpdate(question._id, {
      $pull: { answers: answerId },
    });

    // Remove the answer from the user's answers array
    await User.findByIdAndUpdate(answer.user, { $pull: { answers: answerId } });

    // Delete the answer
    await Answer.findByIdAndDelete(answerId);

    return res
      .status(200)
      .json({ success: true, message: "Answer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
