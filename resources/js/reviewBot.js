const express = require("express");
const router = express.Router();

router.get("/NL", (req, res) => {
  // Imports the Google Cloud client library
  const language = require("@google-cloud/language");

  // Instantiates a client
  const client = new language.LanguageServiceClient();

  // The text to analyze
  const text = "Hello, world!";

  const document = {
    content: text,
    type: "PLAIN_TEXT"
  };

  // Detects the sentiment of the text
  client
    .analyzeSentiment({ document: document })
    .then(results => {
      const sentiment = results[0].documentSentiment;
      return res.status(200).send(`Text: ${text} Sentiment score: ${sentiment.score} Sentiment magnitude: ${sentiment.magnitude}`);
    })
    .catch(err => {
      return res.send(err);
    });

});

module.exports = router;
