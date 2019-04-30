const express = require('express');
const jsforce = require('jsforce');
const mysql = require('mysql');

const jwtAuthenticate = require('./jwtauthenticate');

const router = express.Router();

router.get('/login', jwtAuthenticate, function(req, res, next) {
    // Redirect to Salesforce login/authorization page
    res.redirect(global.oauth2.getAuthorizationUrl({scope: 'api id web refresh_token'}));
  });

// GET token page (SF login callback page)
router.get('/token', jwtAuthenticate, function(req, res, next) {
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
    res.redirect('/webloader');
  });
});

module.exports = router;
