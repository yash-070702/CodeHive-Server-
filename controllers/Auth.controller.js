const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP.model");
const User = require("../models/User.model");

exports.sendotp = async (req, res) => {
  try {
    //email lekr aao from req ki body se
    const { email } = req.body;

    // ab phle check karo ki user exist to nhi krta hai
    const checkUserPresent = await User.findOne({ email });

    //agr exist krdeta hai to bhaga do use khkr ki tum to phle se hi presnet ho bhai
    if (checkUserPresent) {
      return res.status(500).json({
        success: false,
        message: `User Already exist`,
      });
    }

    //now generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabhets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    console.log("OTP GENERATED", otp);

    //check that otp is unique is not
    let result = await OTP.findOne({ otp: otp });

    // yhe jbtk otp generate karega tb tk unique na ban jae otp
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabhet: false,
        lowerCaseAlphabet: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    // ab db m entry bna rhe h
    const otpBody = await OTP.create({ email, otp });
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP sent suucessfully",
      otp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    //fetching data from req body
    const { fullName, userName, email, password, confirmPassword, otp } =
      req.body;

    //validate krlo

    if (
      !fullName ||
      !userName ||
      !email ||
      !confirmPassword ||
      !password ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    
    // check kro ki password and confirm password match krrre h ya nhi
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password not match please try again",
      });
    }

    //check kro ki user exist krta hai
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User exist already",
      });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({
        success: false,
        message: "UserName already taken",
      });
    }

    // ho skta hai ki user ne 2 baar otp generate krlia ho to mjhe lastets waala otp fetch krke lana hai database se
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    // console.log(recentOtp);
    console.log(recentOtp.otp);

    //vaildate OTP
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      //Invalid OTP
      return res.status(400).json({
        success: false,
        message: `Invalid  OTP`,
      });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create in db

    const user = await User.create({
      fullName,
      userName,
      email,
      password: hashedPassword,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${fullName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User is Registered Sucessfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    // get data from req body
    const { email, password } = req.body;

    //validation data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required,please try again",
      });
    }
    // check user exist or not
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not Registered,Please signup first",
      });
    }

    //password matching and creating jwt token
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      (user.token = token), (user.password = undefined);
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      };

      //create cookie and send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  return res
    .status(200)
    .cookie("token", "", { expires: new Date(Date.now()) })
    .json({
      success: true,
      message: "Logout Successfully",
    });
};
