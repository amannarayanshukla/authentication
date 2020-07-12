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
  me,
} = require("../controller/user.auth");

const router = express.Router();

router.route("/auth/reset/:token").get(resetPassword).post(addPassword);
router.route("/auth/register").post(register);
router.route("/auth/login").post(login);
router.route("/auth/logout").post(jwtVerification, logout);
router.route("/auth/forgot").post(forgot);
router.route("/auth/token").post(token);
router.route("/me").get(jwtVerification, me);

module.exports = router;
