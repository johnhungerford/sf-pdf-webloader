const jsforce = require('jsforce');

module.exports = function(req, res, next) {
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
      });

      return next();
    }

    if (global.sfConfig.type === 'oauth') {
      return res.json({ success: false, failure: true, oauthrenew: true });
    }
    
    return next(new Error('Invalid Salesforce connection configuration'));
  } 
}
