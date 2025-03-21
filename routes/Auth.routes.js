// Import the required modules
const express = require("express")
const router = express.Router();

const {
    login,
    signup,
    sendotp,
    logout,
    changePassword,
    resetPasswordToken,
  } = require("../controllers/Auth.controller");

  const { auth } = require("../middlewares/Auth.middleware");

  // Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************



// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp)

router.post("/logout", logout);

router.put("/changePassword",auth, changePassword);

router.post("/reset-password-token", resetPasswordToken)

module.exports = router