const passport = require('passport');
const passportLocal = require('passport-local');
const passportJwt = require('passport-jwt');
const jwt = require('jsonwebtoken');

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
      conn.query(`SELECT * FROM users WHERE username="${username}"`, function (err, result) {
          if (err) return done(err);
          if (result.length === 0) return done(null, false, { message: 'Invalid user or password' });
          bcrypt.compare(password, result[0].password, (err, res) => {
              if (err) return done(null, false, { message: 'Invalid user or password' });
              if (res) return done(
                  null, 
                  { 
                      username: username,
                  }
              );
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
