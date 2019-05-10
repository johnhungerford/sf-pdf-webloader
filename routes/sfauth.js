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
  if (!req.query.code) return res.render('failure');
  req.session.sfauthcode = req.query.code;
  res.render('close');
});

module.exports = router;
