"use strict";
const Users = require("../model/user.auth");
const { ErrorHandler } = require("../util/errorhandling");
const { asyncHandler } = require("../util/asyncHandler");
const { jwtVerification } = require("../middleware/jwt");

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
