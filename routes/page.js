var express = require('express');
var jsforce = require('jsforce');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if (!req.session.accessToken || !req.session.instanceUrl) { 
		res.redirect('/auth/login'); 
	} else {
		res.render('index', { title: 'Express' });
	}
});

// GET login page
router.get('/auth/login', function(req, res, next) {
  // Redirect to Salesforce login/authorization page
  console.log("I'm here!!");
  res.redirect(oauth2.getAuthorizationUrl({scope: 'api id web refresh_token'}));
});

// GET token page (SF login callback page)
router.get('/token', function(req, res, next) {
    const conn = new jsforce.Connection({oauth2: oauth2}); // oauth2 is defined in app.js, global scope
    const code = req.query.code;
    conn.authorize(code, function(err, userInfo) {
        if (err) { return console.error("This error is in the auth callback: " + err); }
		console.log('Access Token: ' + conn.accessToken);
        console.log('Instance URL: ' + conn.instanceUrl);
        console.log('refreshToken: ' + conn.refreshToken);
        console.log('User ID: ' + userInfo.id);
        console.log('Org ID: ' + userInfo.organizationId);
        req.session.accessToken = conn.accessToken;
        req.session.instanceUrl = conn.instanceUrl;
        req.session.refreshToken = conn.refreshToken;

		var string = encodeURIComponent('true');
	    res.redirect('http://localhost:3000/?valid=' + string);
	});
});

module.exports = router;
