const mongoose = require("mongoose");
require("dotenv").config();

const url =
  "mongodb+srv://" +
  process.env.MONGODB_USER +
  ":" +
  process.env.MONGODB_PASSWORD +
  "@chat.sfqnr.mongodb.net/?retryWrites=true&w=majority&appName=Chat";
const connect = mongoose
  .connect(url, { useNewUrlParser: true })
  .then(console.log("Connected to MongoDB"))
  .catch((e: any) => console.log(e));
module.exports = connect;
