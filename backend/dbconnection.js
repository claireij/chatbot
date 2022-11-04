const  mongoose  = require("mongoose");
require('dotenv').config();

const  url  =  'mongodb+srv://claire:' + process.env.MONGODB_PASSWORD + '@chat.h2b4b91.mongodb.net/?retryWrites=true&w=majority';
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });
module.exports  =  connect;