var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var httpClient = require('request');
var jsforce = require('jsforce');
var minimist = require('minimist');

global.appRoot = path.resolve(__dirname);


var pageRouter = require('./routes/page');
var apiRouter = require('./routes/api');
var docRouter = require('./routes/doc');

console.log('Dirname: '+global.appRoot);

// Get arguments
const args = process.argv.slice(2);
if (args[0] === undefined) throw new Error('Configuration file required for Salesforce connected app');
const sfAppConfig = args[0];

// Get configuration from file referenced in only argument
const config = require(sfAppConfig[0] !== '/' ? './' + sfAppConfig : sfAppConfig);
if(config.id === undefined || config.secret === undefined || config.redirect === undefined || config.url === undefined) {
  throw new Error('Invalid Salesforce connected app configuration');
}

//jsForce connection
oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl : config.url,
    // clientId and Secret will be provided when you create a new connected app in your SF developer account
    clientId : config.id,
    clientSecret : config.secret,
    // redirectUri is the url sf will redirect you to when oauth is complete
    redirectUri : config.redirect,
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
