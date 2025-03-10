const express = require("express");
const router = express.Router();

const { createComment } = require("../controllers/Comment.controller");
const { auth } = require("../middlewares/Auth.middleware");

router.post("/createComment", auth, createComment);

module.exports = router;
