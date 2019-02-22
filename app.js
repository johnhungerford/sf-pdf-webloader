var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var httpClient = require('request');
var jsforce = require('jsforce');

global.appRoot = path.resolve(__dirname);


var pageRouter = require('./routes/page');
var apiRouter = require('./routes/api');
var docRouter = require('./routes/doc');

console.log('Dirname: '+global.appRoot);



//jsForce connection
oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl : 'https://na85.salesforce.com',
    //clientId and Secret will be provided when you create a new connected app in your SF developer account
    clientId : '3MVG9KsVczVNcM8wWxTuGMVa0EwaCDVMhLWVSEPM5cIbkQwAv2daVYuNfqnA6D_KxXbPPRYxsOTsBiXiWhszc',
    clientSecret : '6646022498909279346',
    //redirectUri : 'http://localhost:' + port +'/token'
    redirectUri : 'http://sfwebloader.herokuapp.com/token'
});

console.log(oauth2);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(session({secret: 'S3CRE7', resave: true, saveUninitialized: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRouter);
app.use('/api', apiRouter);
app.use('/doc', docRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
