const mongoose = require("mongoose");
import { mongodbUser, mongodbPassword } from "./config"

const url =
  "mongodb+srv://" +
  mongodbUser +
  ":" +
  mongodbPassword +
  "@chat.sfqnr.mongodb.net/?retryWrites=true&w=majority&appName=Chat";
const connect = mongoose
  .connect(url, { useNewUrlParser: true })
  .then(console.log("Connected to MongoDB"))
  .catch((e: any) => console.log(e));
module.exports = connect;
