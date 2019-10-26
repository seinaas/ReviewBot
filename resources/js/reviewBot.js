const express = require("express");
const router = express.Router();

router.post("/NL", (req, res) => {
  // Imports the Google Cloud client library
  const language = require("@google-cloud/language");

  // Instantiates a client
  const client = new language.LanguageServiceClient();
  const text = "";
  const body = req.body;
  // The text to analyze
  body.array.forEach(element => {
    text += element.review + ". ";
  });

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
