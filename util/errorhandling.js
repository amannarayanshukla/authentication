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
  if (err && err.message) {
    if (err.message.toLowerCase() === "invalid signature") {
      statusCode = 500;
    } else if (err.message.toLowerCase() === "jwt expired") {
      statusCode = 400;
    } else if (err.message.toLowerCase() === "invalid access token") {
      statusCode = 400;
      message = err.result;
    } else if (
      err.message.toLowerCase() === "command_obj.callback is not a function"
    ) {
      statusCode = 400;
      message = `Please check the input.`;
    } else if (
      err.message.toLowerCase() ===
      "cannot read property 'verifyjwttoken' of null"
    ) {
      statusCode = 400;
      message = `invalid refresh token `;
    }
  } else if (err.code === 11000) {
    statusCode = 400;
    message = `Email or username already in use.`;
  } else if (!statusCode) {
    statusCode = 500;
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
