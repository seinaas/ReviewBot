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
client.analyzeSentiment({ document: document }).then(results => {
  const sentiment = results[0].documentSentiment;
  console.log(`Text: ${text}`);
  console.log(`Sentiment score: ${sentiment.score}`);
  console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
}).catch( err=>{
    console.log(err)
});


[
  [
      {
          "sentences": [
              {
                  "text": {
                      "content": "This airline is always pretty consistent.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.699999988079071,
                      "score": 0.699999988079071
                  }
              },
              {
                  "text": {
                      "content": "No issues quick boarding and actually left on time.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.699999988079071,
                      "score": 0.699999988079071
                  }
              },
              {
                  "text": {
                      "content": "The only thing they need to improve is the actual way they board.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.30000001192092896,
                      "score": 0.30000001192092896
                  }
              },
              {
                  "text": {
                      "content": "They use group numbers yet the person sitting on the aisle on my row was already sitting.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.5,
                      "score": -0.5
                  }
              },
              {
                  "text": {
                      "content": "The fact that now she has to get up and allow me to put my bags elsewhere clogs the aisle.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.10000000149011612,
                      "score": -0.10000000149011612
                  }
              },
              {
                  "text": {
                      "content": "I was told they board from the windows out, I had window and middle seat and yet this woman had already made herself pretty comfortable.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0.800000011920929,
                      "score": 0.800000011920929
                  }
              }
          ],
          "documentSentiment": {
              "magnitude": 3.299999952316284,
              "score": 0.30000001192092896
          },
          "language": "en"
      },
      null,
      null
  ],
  [
      {
          "sentences": [
              {
                  "text": {
                      "content": "Many hidden fees.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0,
                      "score": 0
                  }
              },
              {
                  "text": {
                      "content": "I fly Southwest and Delta Airlines.",
                      "beginOffset": -1
                  },
                  "sentiment": {
                      "magnitude": 0,
                      "score": 0
                  }
              }
          ],
          "documentSentiment": {
              "magnitude": 0,
              "score": 0
          },
          "language": "en"
      },
      null,
      null
  ]
]