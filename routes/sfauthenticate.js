const jsforce = require('jsforce');

module.exports = function(req, res, next) {
  console.log(`sfAuthenticate(): authenticating SF Api requestion (${req.originalUrl})`);
  if (res.locals.username === undefined || res.locals.username === null || res.locals.username === '') {
    return res.json({ success: false, sfreauth: true, message: 'missing username' });
  }

  console.log('req.query:');
  console.log(req.query);
  console.log('\n\n\nreq.body:');
  console.log(req.body);

  if (
    (
      req.params.sfconnid === undefined || 
      req.params.sfconnid === null || 
      req.params.sfconnid === ''
    ) && (
      req.query.sfconnid === undefined ||
      req.query.sfconnid === null ||
      req.query.sfconnid === ''
    ) && (
      req.body.sfconnid === undefined ||
      req.body.sfconnid === null ||
      req.body.sfconnid === ''
    ) && (
      req.session.sfauthcode === undefined ||
      req.session.sfauthcode === null
    )
  ) return res.json({ success: false, message: 'no sf configuration received' });

  const sfconnid = req.params.sfconnid === undefined ? req.body.sfconnid === undefined ? req.query.sfconnid : req.body.sfconnid : req.params.sfconnid;
  console.log('sfconn id', sfconnid);
  global.mysql.query(
    `SELECT title, config FROM sfconnections WHERE id='${sfconnid}'`,
    (errQuery, resQuery)=>{
      if (errQuery) return next(errQuery);
      if (resQuery.length != 1) return res.json({ success: false, message: 'no Salesforce connection config found!' });
      if (resQuery[0].config === undefined) {
        return res.json({success: false, message: 'no Salesforce configuration available'});
      }

      const config = JSON.parse(resQuery[0].config);
      console.log('SFCONFIG:');
      console.log(config);
      if (config.oauth === undefined) {
        return res.json({success: false, message: 'no Salesforce connected app oauth information in connection config!'});
      }

      const oauth = new jsforce.OAuth2(config.oauth);

      const sfconn =  new jsforce.Connection(oauth);
      if (req.session.accessToken && req.session.instanceUrl) { 
        console.log(`sfAuthenticate(): session tokens found (${req.originalUrl})`);
        sfconn.initialize({
          instanceUrl : req.session.instanceUrl,
          accessToken : req.session.accessToken,
          refreshToken : req.session.refreshToken
        });

        res.locals.sfconn = sfconn;
        return next();
      }

      if (req.session.sfauthcode) {
        console.log(`sfAuthenticate(): authorization code found (${req.originalUrl})`);
        sfconn.authorize(req.session.sfauthcode, (errAuth, resAuth) => {
          if (errAuth) {
            req.session.sfauthcode = null
            return req.json({success: false, message: 'sfAuthenticate(): invalid salesforce authorization code'});
          }

          req.session.accessToken = sfconn.accessToken;
          req.session.instanceUrl = sfconn.instanceUrl;
          req.session.refreshToken = sfconn.refreshToken;
          res.locals.sfconn = sfconn;
          return next();
        });

        return;
      }

      if (config.type === 'login') {
        if(
          config.login === undefined || 
          config.login.password === undefined ||
          config.login.username === undefined
        ) return res.json({success: false, message: 'no login credentials for salesforce in configuration'});

        return sfconn.login(config.login.username, config.login.password, (errConn, userInfo)=>{
          if (errConn) return res.json({success: false, message: 'unable to login to salesforce with config credentials'});
          req.session.accessToken = sfconn.accessToken;
          req.session.instanceUrl = sfconn.instanceUrl;
          req.session.refreshToken = sfconn.refreshToken;

          console.log(`sfAuthenticate(): Retrieved connection from login (${req.originalUrl})`);
          res.locals.sfconn = sfconn;
          return next();
        });
      }

      if (config.type === 'oauth') {
        return res.json(
          { 
            success: false, 
            failure: true, 
            sfreauth: true, 
            redirect: oauth.getAuthorizationUrl({scope: 'api id web refresh_token'}), 
          }
        );
      }
        
      return res.json({ success: false, message: 'Sf connection configuration type unknown'});
    }
  );
}
