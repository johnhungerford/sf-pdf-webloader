var express = require('express');
var jsforce = require('jsforce');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET app page. */
router.get('/webloader', function(req, res, next) {
  if (req.session.accessToken || !req.session.instanceUrl) { 
    const conn = new jsforce.Connection({oauth2: oauth2}); // oauth2 is defined in app.js, global scope
    conn.login('guest@sfwebloader.com','testpwd', function(err, userInfo) {
      if (err) { return next(new Error("This error is in the auth callback: " + err); }
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
  
  res.render('app');
});

module.exports = router;
