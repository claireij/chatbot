const  mongoose  = require("mongoose");

// TODO: set the right connection string :)
const  url  =  "mongodb://localhost:27017/chat";
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });
module.exports  =  connect;