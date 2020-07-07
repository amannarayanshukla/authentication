"use strict";
const Users = require("../model/user.auth");
const { ErrorHandler } = require("../util/errorhandling");
const { asyncHandler } = require("../util/asyncHandler");

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

  const data = await user.save();
  if (!data) {
    return next(
      new ErrorHandler(404, "Enter while inserting a registering a new user")
    );
  }

  return res.status(200).json({
    success: true,
    data,
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

  const user = await Users.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorHandler(401, "Invalid credentials"));
  }

  const result = await user.comparePassword(password);
  if (!result) {
    return next(new ErrorHandler(401, "Invalid credentials"));
  }

  return res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc logout a user
// @route POST /api/v1/auth/logout
// @access private
exports.logout = (req, res, next) => {
  return res.status(200).json({ success: true, data: {} });
};
