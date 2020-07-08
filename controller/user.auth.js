"use strict";
const nodemailer = require("nodemailer");

const crypto = require("crypto");
const Users = require("../model/user.auth");
const { ErrorHandler } = require("../util/errorhandling");
const { asyncHandler } = require("../util/asyncHandler");
// const { jwtVerification } = require("../middleware/jwt");

// @desc register a user
// @route POST /api/v1/auth/register
// @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const { email, name, username, password, role } = req.body;
  let user = new Users({
    email,
    name,
    username,
    password,
    role,
  });

  user = await user.save();
  if (!user) {
    return next(
      new ErrorHandler(404, "Enter while inserting a registering a new user")
    );
  }

  return res.status(200).json({
    success: true,
    data: {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    },
  });
});

// @desc login a user
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(400, "Please provide email and password"));
  }

  let user = await Users.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler(401, "Invalid credentials"));
  }

  const result = await user.comparePassword(password);
  if (!result) {
    return next(new ErrorHandler(401, "Invalid credentials"));
  }

  const accessToken = await user.createAccessToken();
  const refreshToken = await user.createRefreshToken();

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;

  user = await user.save();

  return res.status(200).json({
    success: true,
    data: {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    },
  });
});

// @desc logout a user
// @route POST /api/v1/auth/logout
// @access private
exports.logout = asyncHandler(async (req, res, next) => {
  const user = await Users.findOne({ email: req.email });
  user.accessToken = undefined;
  user.refreshToken = undefined;
  user.save();
  return res.status(200).json({ success: true, data: {} });
});

// @desc forgot a user's password
// @route POST /api/v1/auth/forgot
// @access public
exports.forgot = asyncHandler(async (req, res, next) => {
  //create a unique token
  const resetPasswordToken = crypto.randomBytes(16).toString("hex");
  const user = await Users.findOne({ email: req.body.email });
  //token validity will be 1 hour
  const resetPasswordExpire = Date.now() + 360000;
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpire = resetPasswordExpire;
  user.save();

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "noreply@imaman.in", // sender address
    to: user.email, // list of receivers
    subject: "Password reset", // Subject line
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/api/v1/reset/${resetPasswordToken} \n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc reset a user's password
// @route POST /api/v1/auth/forgot
// @access public
exports.reset = asyncHandler(async (req, res, next) => {
  const token = req.params.token;
  const { newPassword } = req.body;
  if (!token) {
    next(new ErrorHandler(400, "No token is found"));
  }

  const user = await Users.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    next(
      new ErrorHandler(400, "Invalid password reset token or it has expired.")
    );
  }
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return res.status(200).json({
    success: true,
    data: {},
  });
});
