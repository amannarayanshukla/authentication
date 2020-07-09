"use strict";
const mongoose = require("mongoose");
const redis = require("redis");

// Connection URL
const url = process.env.MONGODB_URL;

// Database Name
const dbName = process.env.DATABASE_NAME;

//configure redis client
const client = redis.createClient(process.env.REDIS_PORT);

const db = async () => {
  mongoose.connect(url + dbName, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  client.on("connect", function () {
    console.error(`Redis default connection is open`.cyan);
  });

  client.on("error", function (error) {
    console.error(`Redis default error has occured ${error}`.red);
  });

  mongoose.connection.on("connected", function () {
    console.log(`Mongoose default connection is open to ${url + dbName}`.cyan);
  });

  mongoose.connection.on("error", function (err) {
    console.log(`Mongoose default connection error has occured ${err}`.red);
  });

  mongoose.connection.on("disconnected", function () {
    console.log("Mongoose default connection is disconnected".yellow);
  });

  process.on("SIGINT", function () {
    mongoose.connection.close(function () {
      console.log(
        "Mongoose default connection is disconnected due to application termination"
          .blue
      );
      process.exit(0);
    });
  });
};

// Use connect method to connect to the server
module.exports = {
  db,
  client,
};
