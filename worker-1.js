// var amqp = require("amqplib/callback_api");
// const CONN_URL =
//   "amqp://dtxzyfqn:j9MInR3Qq6lyLQJCGHjnqRv4jFQ7G8WY@lionfish.rmq.cloudamqp.com/dtxzyfqn";
// amqp.connect(CONN_URL, function (err, conn) {
//   conn.createChannel(function (err, ch) {
//     ch.consume(
//       "registration-email",
//       function (msg) {
//         console.log(".....");
//         setTimeout(function () {
//           console.log("Message:", msg.content.toString());
//         }, 4000);
//       },
//       { noAck: true }
//     );
//   });
// });

const amqp = require("amqplib/callback_api");
const CONN_URL = "";
let ch = null;
amqp.connect(CONN_URL, function (err, conn) {
  //
  if (err) {
    return console.log("rabbitMQ error");
  }

  //create channel
  conn.createChannel(function (err, channel) {
    if (err) {
      console.log(err, "error creating channel");
    }
    //Assert queue
    const QUEUE = "some queue";
    channel.assertQueue(QUEUE);

    //Send message to queue
    channel.consume(
      QUEUE,
      (msg) => {
        console.log("message received" + msg.content);
      },
      {
        noAck: true,
      }
    );
  });
});
