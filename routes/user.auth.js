"use strict";
const express = require("express");
const jwtVerification = require("../middleware/jwt");

const {
  register,
  login,
  logout,
  forgot,
  reset,
} = require("../controller/user.auth");

const router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", jwtVerification, logout)
  .post("/forgot", forgot)
  .post("/reset/:token", reset);

module.exports = router;
