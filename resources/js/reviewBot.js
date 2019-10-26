const express = require("express");
const router = express.Router();

// Imports the Google Cloud client library
const language = require("@google-cloud/language");
// Instantiates a client
const client = new language.LanguageServiceClient();

router.post("/sentiment", (req, res) => {

  const result = req.body;
  const sentiment = [];
  const response = [];

  for (var i = 0; i < result.length; i++) {
    // The text to analyze
    const document = {
      content: result[i].text,
      type: "PLAIN_TEXT"
    };

    sentiment.push(client.analyzeSentiment({ document: document }));
  }

  Promise.all(sentiment).then(results => {
    for (var i = 0; i < results.length; i++) {
      response.push(results[i][0].documentSentiment);
    }
    return res.status(200).send(response);
  });
});


//Analyze entities
router.post("/entities", (req, res) => {
  const result = req.body;
  const sentiment = [];
  const response = [];

  for (var i = 0; i < result.length; i++) {
    // The text to analyze
    const document = {
      content: result[i].text,
      type: "PLAIN_TEXT"
    };

    sentiment.push(client.analyzeEntities({ document: document }));
  }

  Promise.all(sentiment).then(results => {
    for (var i = 0; i < results.length; i++) {
      response.push(results[i][0].documentSentiment);
    }
    return res.status(200).send(response);
  });
});

module.exports = router;
