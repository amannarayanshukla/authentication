"use strict";
const express = require("express");
const jwtVerification = require("../middleware/jwt");

const { register, login, logout } = require("../controller/user.auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", jwtVerification, logout);

module.exports = router;
