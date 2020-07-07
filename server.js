require('dotenv').config({ path: './config/.env' });
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');

const db = require('./config/db');
const auth = require('./routes/user.auth');
const { handleError, ErrorHandler } = require('./util/errorhandling');

const app = express();

// connect the database
db();

// create application/json parser
const jsonParser = bodyParser.json();

app.use('/api/v1/auth', jsonParser, auth);

app.all('*', (req, res, next) => {
    next(new ErrorHandler(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`.cyan);
});
