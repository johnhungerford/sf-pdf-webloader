var express = require('express');
var jsforce = require('jsforce');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET app page. */
router.get('/webloader', function(req, res, next) {
  if (!req.session.accessToken || !req.session.instanceUrl) { 
    if (global.sfConfig.type === 'login') {
      const conn = new jsforce.Connection({oauth2: global.oauth2}); // oauth2 is defined in app.js, global scope
      conn.login('guest@sfwebloader.com','testpwd', function(err, userInfo) {
        if (err) { return next(new Error("This error is in the auth callback: " + err)); }
        console.log('Access Token: ' + conn.accessToken);
        console.log('Instance URL: ' + conn.instanceUrl);
        console.log('refreshToken: ' + conn.refreshToken);
        console.log('User ID: ' + userInfo.id);
        console.log('Org ID: ' + userInfo.organizationId);
        req.session.accessToken = conn.accessToken;
        req.session.instanceUrl = conn.instanceUrl;
        req.session.refreshToken = conn.refreshToken;
        res.render('app');
      });

      return;
    }

    if (global.sfConfig.type === 'oauth') {
      res.redirect('/auth/login');
      return;
    }
    
    next(new Error('Invalid Salesforce connection configuration'));
    return;
  } 
  
  res.render('app');
});

router.get('/auth/login', function(req, res, next) {
  // Redirect to Salesforce login/authorization page
  res.redirect(global.oauth2.getAuthorizationUrl({scope: 'api id web refresh_token'}));
});

// GET token page (SF login callback page)
router.get('/token', function(req, res, next) {
  const conn = new jsforce.Connection({oauth2: global.oauth2}); // oauth2 is defined in app.js, global scope
  const code = req.query.code;
  conn.authorize(code, function(err, userInfo) {
    if (err) return console.error("This error is in the auth callback: " + err);
    console.log('Access Token: ' + conn.accessToken);
    console.log('Instance URL: ' + conn.instanceUrl);
    console.log('refreshToken: ' + conn.refreshToken);
    console.log('User ID: ' + userInfo.id);
    console.log('Org ID: ' + userInfo.organizationId);
    req.session.accessToken = conn.accessToken;
    req.session.instanceUrl = conn.instanceUrl;
    req.session.refreshToken = conn.refreshToken;
    res.redirect('https://sfwebloader.herokuapp.com/webloader?valid=true');
  });
});

module.exports = router;
