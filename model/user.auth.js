"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Errorhandler } = require("../util/errorhandling");
const { asyncHandler } = require("../util/asyncHandler");

const saltRounds = 10;
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email address is required"],
      validate: [validator.isEmail, "Please add a valid email address"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email address",
      ],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "name is required"],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "username is required"],
      index: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: Number,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    accessToken: String,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

//Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  const salt = await bcrypt.genSalt(saltRounds);
  // hash the password using our new salt and override the current password with the hashed one
  user.password = await bcrypt
    .hash(user.password, salt)
    .catch((err) => next(new Errorhandler(500, "Can't hash password")));
  user.accessToken = await user.createAccessToken();
  // .catch((err) => next(new Errorhandler(500, "Can't create token")));
  user.refreshToken = await user.createRefreshToken();
  // .catch((err) => next(new Errorhandler(500, "Can't create token")));
  next();
});

//Compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

//Create access token
UserSchema.methods.createAccessToken = function () {
  return jwt.sign(
    { email: this.email, role: this.role },
    process.env.JWT_ACCESS_SECRET_KEY,
    { expiresIn: "1h" }
  );
};

//Refresh token
UserSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    { email: this.email, role: this.role },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: "1d" }
  );
};

//Verify JWT token
UserSchema.methods.verifyJWTToken = function (token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
};

module.exports = mongoose.model("Users", UserSchema);
