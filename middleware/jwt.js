const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../util/asyncHandler');

const jwtVerification = asyncHandler(async (req, res, next) => {
    const decoded = jwt.verify(
        req.body.accessToken,
        process.env.JWT_ACCESS_SECRET_KEY
    );
    req.email = decoded.email;
    next();
});

module.exports = jwtVerification;
