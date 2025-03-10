const express = require("express");
const router = express.Router();

const {
  createAnswer,
  deleteAnswer,
  editAnswer,
} = require("../controllers/Answer.controller");

const { auth } = require("../middlewares/Auth.middleware");

router.post("/createAnswer", auth, createAnswer);
router.delete("/deleteAnswer/:answerId", auth, deleteAnswer);
router.put("/editAnswer/:answerId", auth, editAnswer);

module.exports = router;
