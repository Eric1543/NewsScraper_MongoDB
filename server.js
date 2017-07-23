//Dependencies and definitions
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Article = require("./models/Article.js");
var Comment = require("./models/Comment.js");

var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({ type:"application./vnd.api+json"}));

var exphbs = require("express-handlebars");
app.use(express.static(__dirname + "/public"));
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");	

mongoose.connect("mongodb://localhost/mongoScraper", {
	useMongoClient: true
});

var db = mongoose.connection;

db.on("error", function(error){
	console.log("Mongoose Error:", error);
});

db.once("openUri", function(){
	console.log("Mongoose connection successful.");
});

// require("./routes/api-routes.js")(app);

// Searches database for all articles and renders as a handlebars object
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsObject ={
        entry: doc
      };
      res.render("index", hbsObject);
    }
  });
});

app.post("/saveArticle/:id", function(req, res){
  Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true})
  .exec(function(err, doc){
  if (err) {
    console.log(err);
  }
  else {
    console.log(doc);
  }
  });
});

app.post("/deleteArticle/:id", function(req, res){
  Article.findOneAndUpdate({"_id": req.params.id}, {"saved": false})
  .exec(function(err, doc) {
  // Log any errors
  if (err) {
    console.log(err);
  }
  else {
    // Or send the document to the browser
    res.redirect("/saved");
  }
  });
});

app.get("/saved", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      console.log("In app.get saved");
      var hbsObject ={
        entry: doc
      };
      res.render("saved", hbsObject);
    }
  });
});

// Scrapes reddit news and saves the results into the database as an array of objects
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.reddit.com/r/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("a.title").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).attr("href");
      result.saved = false;
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);
      // Check so no duplicates added to DB
      Article.findOne({"title": result.title}, function(err, doc){
        if(doc===null){
          entry.save(function(err, doc){
            if (err) {
              console.log(err);
            }
            else {
              console.log("Saving result(s)");
              console.log(doc);
            }
          });
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

app.post("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://www.reddit.com/r/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("a.title").each(function(i, element) {
      // Save an empty result object
      var result = {};
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      result.link = $(this).attr("href");
      result.saved = false;
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);
      // Check so no duplicates added to DB
      Article.findOne({"title": result.title}, function(err, doc){
        if(doc===null){
          entry.save(function(err, doc){
            if (err) {
              console.log(err);
            }
            else {
              console.log("Saving result(s)");
              console.log(doc);
            }
          });
        }
      });
    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("/");
  res.send("Scrape Complete");
});

app.listen(3000, function() {
	console.log("App running on port 3000!");
})