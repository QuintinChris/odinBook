var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var mongoose = require('mongoose');
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var friendsRouter = require('./routes/friends');
var commentsRouter = require('./routes/comments');

// Establish and connect database
var mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

// Set up facebook login
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://127.0.0.1:3000/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, done) {
    User.findOrCreate(User, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));









var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/users/friends', friendsRouter);
app.use('/posts/:id/comments', commentsRouter);

// GET home page
app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// GET login
app.get("/login", (req, res) => res.render("login", { user: req.user }));
app.get("/login/github", passport.authenticate("github"));

// Facebook login
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
