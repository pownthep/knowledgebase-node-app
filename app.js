const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Init app
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','pug');

// Body Parser Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:false}));
// Parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', function(req,res) {
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    }
    else {
      res.render('index', {
        title:'Articles',
        articles: articles
      });
    }
  });
});

// Get single article
app.get('/articles/:id', function(req,res){
  Article.findById(req.params.id, function(err,article) {
    res.render('article', {
      article: article
    });
  });
});

// Load edit form
app.get('/articles/edit/:id', function(req,res){
  Article.findById(req.params.id, function(err,article) {
    res.render('edit_article', {
      Title: 'Edit article',
      article: article
    });
  });
});

// Update submit POST route
app.post('/articles/edit/:id', function(req,res){
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    }
    else {
      res.redirect('/');
    }
  });
});

// Add route
app.get('/articles/add', function(req,res){
  res.render('add_articles', {
    Title:'Add Article'
  });
});

// Add submit POST route
app.post('/articles/add', function(req,res){
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  article.save(function(err){
    if(err){
      console.log(err);
      return;
    }
    else {
      res.redirect('/');
    }
  });
});

app.delete('/articles/:id', function(req,res){
  let query = {_id:req.params.id}
  Article.remove(query,function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  });
});

// Start server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
