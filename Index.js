//Libraries
const express = require("express");
const cors = require("cors");
const reviewBot = require("./resources/js/reviewBot.js");
const bodyParser = require("body-parser");

//Server info
const myApp = express();
const port = 8000;

//Middleware
myApp.use(cors());
myApp.use(bodyParser.json());

//Routes
myApp.use('/reviewBot', reviewBot);

//Hosting
const server = myApp.listen(port, ()=>{
  const host = server.address().address;
  console.log(`Server running at http://${host}:${port}/`);
})