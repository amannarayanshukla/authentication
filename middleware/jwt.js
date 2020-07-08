const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const { asyncHandler } = require("../util/asyncHandler");

const jwtVerification = asyncHandler(async (req, res, next) => {
  let accessToken;
  if (req.headers.cookie) {
    accessToken = cookie.parse(req.headers.cookie);
    accessToken = accessToken.authentication;
  } else {
    accessToken = req.body.accessToken;
  }

  const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY);
  req.email = decoded.email;
  next();
});

module.exports = jwtVerification;
