const express = require("express");
const cors = require("cors");
const reviewBot = require("./resources/js/reviewBot");
const myApp = express();

const port = 8000;
const hostname = '127.0.0.1';

myApp.use(cors);
myApp.use(express.json());
myApp.use('/resources/reviewBot.js', reviewBot);

myApp.listen(port, ()=>{
  console.log(`Server running at http://${hostname}:${port}/`);
})