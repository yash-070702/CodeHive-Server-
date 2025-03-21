const express = require("express");
const router = express.Router();

const {
  createComment,
  editComment,
  deleteComment,
} = require("../controllers/Comment.controller");
const { auth } = require("../middlewares/Auth.middleware");

router.post("/createComment", auth, createComment);
router.put("/editComment/:commentId", auth, editComment);
router.delete("/deleteComment/:commentId", auth, deleteComment);
module.exports = router;
