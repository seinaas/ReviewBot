const express = require("express");
const router = express.Router();

router.post("/NL", (req, res) => {
    return res.send(naturalLanguage(req));
});

async function naturalLanguage(req) {
  // Imports the Google Cloud client library
  const language = require("@google-cloud/language");

  // Instantiates a client
  const client = new language.LanguageServiceClient();

  const result = req.body;
  const sentiment = [];

  for (var i = 0; i < result.length; i++) {
    // The text to analyze
    const document = {
      content: result[i].text,
      type: "PLAIN_TEXT"
    };

    await client
      .analyzeSentiment({ document: document })
      .then(results => {
            console.log("2");
            sentiment.push(results[0].documentSentiment);
      })
      .catch(err => {
        return err;
      });
  }
  return sentiment;
}

module.exports = router;
