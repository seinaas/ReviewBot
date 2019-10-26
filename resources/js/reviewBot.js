const express = require("express");
const router = express.Router();

router.post("/NL", (req, res) => {
  // Imports the Google Cloud client library
  const language = require("@google-cloud/language");

  // Instantiates a client
  const client = new language.LanguageServiceClient();

  // The text to analyze
  const text = req.body.text;

  const document = {
    content: text,
    type: "PLAIN_TEXT"
  };

  // Detects the sentiment of the text
  client
    .analyzeSentiment({ document: document })
    .then(results => {
        const sentiment = results;
      return res.status(200).json(sentiment);
    })
    .catch(err => {
      return res.send(err);
    });

});

module.exports = router;
