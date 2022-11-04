const  mongoose  = require("mongoose");
require('dotenv').config();

const  url  =  'mongodb+srv://claire:' + process.env.MONGODB_PASSWORD + '@chat.h2b4b91.mongodb.net/?retryWrites=true&w=majority';
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  }).then(console.log('Connected to MongoDB')).catch(e=>console.log(e));;
module.exports  =  connect;