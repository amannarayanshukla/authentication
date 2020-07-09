"use strict";
const express = require("express");
const jwtVerification = require("../middleware/jwt");

const {
  register,
  login,
  logout,
  forgot,
  resetPassword,
  addPassword,
  token,
} = require("../controller/user.auth");

const router = express.Router();

router.route("/reset/:token").get(resetPassword).post(addPassword);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(jwtVerification, logout);
router.route("/forgot").post(forgot);
router.route("/token").post(token);

module.exports = router;
