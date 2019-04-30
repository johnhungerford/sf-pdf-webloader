// Regular Libraries
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const mysql = require('mysql');

// Middleware
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// Root directory
global.appRoot = path.resolve(__dirname);

// Routes
const indexRouter = require('./routes/index');
const appRouter = require('./routes/webloader');
const loginRouter = require('./routes/login');
const sfAuthRouter = require('./routes/sfauth');
const apiRouter = require('./routes/api');
const docRouter = require('./routes/doc');
const configRouter = require('./routes/config');

// Get MySQL connection from sql.config.json file
const sqlConfig = require('./sql.config.json');

// MySQL connection is needed to set up app; create a global pool for use by all routes
global.mysql = mysql.createPool(sqlConfig);

var app = express();

global.mysql.getConnection((err, conn)=>{
  if (err) throw err;
  console.log("Connected to ClearDB");
  conn.query("SELECT config FROM configs WHERE id='session'", function (err, result) {
    if (err) throw err;
    conn.query("SELECT config FROM configs WHERE id='jwt'", function(err2, result2) {
      if (err2) throw err2;
      global.jwtSecret = JSON.parse(result2[0].config).secret;

      require('./config-passport');

      // view engine setup
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'jade');

      // set up up front middleware
      app.use(logger('dev'));
      app.use(session(JSON.parse(result[0].config)));
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use(cookieParser());
      app.use(express.static(path.join(__dirname, 'public')));

      // set up routes
      app.use('/', indexRouter);
      app.use('/webloader', appRouter);
      app.use('/login', loginRouter);
      app.use('/config', configRouter);
      app.use('/sfauth', sfAuthRouter);
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

    });
  });
});


module.exports = app;
