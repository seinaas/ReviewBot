//Libraries
const express = require("express");
const cors = require("cors");
const reviewBot = require("./resources/js/reviewBot.js");
const bodyParser = require("body-parser");

//Server info
const myApp = express();
const port = 8000;
const hostname = '127.0.0.1';

//Middleware
myApp.use(cors());
myApp.use(bodyParser.json());

//Routes
myApp.use('/reviewBot', reviewBot);

//Hosting
myApp.listen(port, hostname, ()=>{
  console.log(`Server running at http://${hostname}:${port}/`);
})