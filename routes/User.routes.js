const express = require("express");
const router = express.Router();

const { getUserById ,deleteUserAccount,getTopUsersByReputation} = require("../controllers/User.controller");
const { auth } = require("../middlewares/Auth.middleware");

router.get("/getUserById/:userId", getUserById);
router.delete("/deleteUserAccount", auth, deleteUserAccount);
router.get("/getTopUsers", getTopUsersByReputation);
module.exports = router;
