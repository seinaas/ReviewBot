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
const brocheAfoin = [];

  for (var i = 0; i < result.length; i++) {
    if (result[i].text != undefined) {
      // The text to analyze
      const document = {
        content: result[i].text,
        type: "PLAIN_TEXT",
        language: "en"
      };
      brocheAfoin.push(result[i].text);
      sentiment.push(client.analyzeSentiment({ document: document }));
    }
  }

  Promise.all(sentiment).then(results => {
    for (var i = 0; i < results.length; i++) {
      response.push({"text": brocheAfoin[i],"magnitude": results[i][0].documentSentiment.magnitude, "score":results[i][0].documentSentiment.score});
    }
    console.log(response);
    return res.status(200).send(response);
  });
});



module.exports = router;
