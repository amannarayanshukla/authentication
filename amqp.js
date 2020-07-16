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
    channel.sendToQueue(QUEUE, Buffer.from("data aman"));
    console.log("message sent");
  });
});
