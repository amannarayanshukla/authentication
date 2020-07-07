"use strict";

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, res) => {
  let { statusCode, message } = err;

  if (
    err &&
    err._message &&
    err._message.toLowerCase() === "users validation failed"
  ) {
    statusCode = 400;
    message = message.replace(/\(.*?\)/gi, "");
  }

  if (err && err.message && err.message.toLowerCase() === "invalid signature") {
    statusCode = 500;
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = `Email or username already in use.`;
  }
  res.status(statusCode).json({
    success: false,
    data: {},
    error: message,
  });
};

module.exports = {
  ErrorHandler,
  handleError,
};
