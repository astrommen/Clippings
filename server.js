// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping Tools
var cheerio = require("cheerio");
var axios = require("axios");

// Initialize models path
var db = require("./models");

// Set Port
var PORT = process.env.PORT || 3000;

// Initializa express
var app = express();

//Configure middleware
// Set Handlebars as the default templating engine.
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");
// Use morgan logger for requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public static folder
app.use(express.static("public"));

// Connect to Mongo DB
mongoose.connect("mongodb://localhost/paleontologyClippings", { useNewUrlParser: true });

// Routes

// Get route for scraping sci-news website
app.get("/scrape", function(req, res){
  // Make request via axios to grab the HTML from `awwards's` clean website section
  axios.get("http://www.sci-news.com/news/paleontology").then(function(response) {

    // Load the HTML into cheerio
    var $ = cheerio.load(response.data);

    // Make an empty array for saving our scraped info
    // With cheerio, look at each paleontology article, enclosed in "h2" tag
    $("div.bottom-archive").each(function(i, element) {
      var results = {};

      results.title = $(element).find("h2").text();
      results.link = $(element).find("h2").children().attr("href");
      results.img = $(element).find("img").attr("src").split(",")[0].split(" ")[0];
 
      // Create a new Artice using result object
      db.Article.create(results).then(function(dbArticle) {
        console.log(dbArticle);
      }).catch(function(err) {
        console.log(err);
      });
    });

    // console.log(results);
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  // Grabb all documents in Articles collection
  db.Article.find({}).then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
