const express = require("express");
const router = express.Router();
const language = require('@google-cloud/language');

router.get("/NL", (req, res) =>{
        res.send("magic");
})
    
  

module.exports = router;