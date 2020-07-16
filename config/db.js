"use strict";
const mongoose = require("mongoose");
const redis = require("redis");
// const ampq = require("amqplib");

// Connection URL
const url = process.env.MONGODB_URL;

// Database Name
const dbName = process.env.DATABASE_NAME;

//configure redis client
const client = redis.createClient(process.env.REDIS_PORT);

let ch = null;

const db = async () => {
  mongoose.connect(url + dbName, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // ampq.connect(process.env.RABBITMQ_URL, function (err, conn) {
  //   if (err) {
  //     console.log("Error connecting to RabbitMQ");
  //   }
  //   console.log("RabbitMQ connection is now open".cyan);
  //
  //   conn.createChannel(function (err, channel) {
  //     ch = channel;
  //   });
  // });

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

  // process.on("exit", (code) => {
  //   ch.close();
  //   console.log("Closing rabbitmq channel".blue);
  // });
};

const publishToQueue = async (queueName, data) => {
  ch.sendToQueue(queueName, new Buffer(data));
};

// Use connect method to connect to the server
module.exports = {
  db,
  client,
  // publishToQueue,
};
