"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
UserSchema.pre("save", function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Users", UserSchema);
