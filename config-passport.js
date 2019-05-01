const passport = require('passport');
const passportLocal = require('passport-local');
const passportJwt = require('passport-jwt');
const passportSfOauth = require('passport-salesforce-oauth2');
const bcrypt = require('bcrypt');

passport.use('register', new passportLocal.Strategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  registerCallback
));

function registerCallback(username, password, done) {
  global.mysql.getConnection((err, conn) => {
      if (err) return done(err);
      conn.query(``, function (err, result) {
          
      });
  });
}

// Configure passport
passport.use('login', new passportLocal.Strategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  loginCallback
));

function loginCallback(username, password, done) {
  global.mysql.getConnection((err, conn) => {
      if (err) return done(err);
      conn.query(`SELECT * FROM users WHERE username="${username}"`, function (error, result) {
          if (error) return done(error);
          if (result.length === 0) return done(null, false, { message: 'Invalid user or password' });
          bcrypt.compare(password, result[0].password, (err2, res) => {
            console.log(result[0].password);
            console.log('hello?');
            console.log(res);
            console.log(err2);
            if (err2) return done(null, false, { message: 'Invalid user or password' });
            if (res) return done(
                null, 
                { 
                    username: username,
                }
            );
            done(null, false, { message: 'Invalid user or password' });
          });
      });
  });
}

passport.use('jwt', new passportJwt.Strategy(
  {
    secretOrKey: global.jwtSecret,
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken,
  },
  jwtCallback
));

function jwtCallback(token, done) {
  try {
    //Pass the user details to the next middleware
    return done(null, token.user);
  } catch (error) {
    done(error);
  }
}
