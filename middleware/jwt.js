const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const { client } = require('../config/db');

const { asyncHandler } = require('../util/asyncHandler');
const { ErrorHandler } = require('../util/errorhandling');

// check if the JWT is valid and also present in Redis
const jwtVerification = asyncHandler(async (req, res, next) => {
    let cookieValues, accessToken, uuid;
    if (req.headers.cookie) {
        cookieValues = cookie.parse(req.headers.cookie);
        accessToken = cookieValues.authentication_accessToken;
        uuid = cookieValues.authentication_uuid;
    } else {
        accessToken = req.body.accessToken;
        uuid = req.body.uuid;
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY);

    client.get(uuid, function (err, reply) {
    // reply is null when the key is missing
        if (err && !reply) {
            return next(new ErrorHandler(400, `Invalid access token`));
        }
        if (!decoded || !reply) {
            return next(new ErrorHandler(400, `Invalid JWT token`));
        } else {
            req.email = decoded.email;
            return next();
        }
    });
});

module.exports = jwtVerification;
