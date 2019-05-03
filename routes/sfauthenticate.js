const jsforce = require('jsforce');

module.exports = function(req, res, next) {
  if (res.locals.username === undefined || res.locals.username === null || res.locals.username === '') {
    return next(new Error('no username!'));
  }

  if (req.params.sfconn === undefined || req.params.sfconn === null || req.params.sfconn === '') {
    return next(new Error('no sfconn selected!'));
  }

  global.mysql.query(
    `SELECT title, config FROM sfconnections WHERE id='${req.params.sfconn}'`,
    (err2, res)=>{
      if (err2) return next(err2);
      if (res.length != 1) return next(new Error('no Salesforce connection config found!'));
      if (res[0].config === undefined) {
        return next(new Error('no Salesforce configuration available'));
      }

      const config = JSON.parse(res[0].config);
      if (config.oauth === undefined) {
        return next(new Error('no Salesforce connected app oauth information in connection config!'));
      }

      const sfconn =  new jsforce.Connection(new jsforce.OAuth2(config.oauth));
      if (!req.session.accessToken && !req.session.instanceUrl) { 
        sfconn.initialize({
          instanceUrl : req.session.instanceUrl,
          accessToken : req.session.accessToken,
          refreshToken : req.session.refreshToken
        });

        res.locals.sfconn = sfconn;
        return next();
      }

      if (res[0].config.type === 'login') {
        if(
          config.login === undefined || 
          config.login.password === undefined ||
          config.login.username === undefined
        ) return next(new Error('no login credentials for salesforce in configuration'));

        sfconn.login(config.login.username, config.login.password, (err3, userInfo)=>{
          if (err3) return next(err3);
          req.session.accessToken = conn.accessToken;
          req.session.instanceUrl = conn.instanceUrl;
          req.session.refreshToken = conn.refreshToken;
        });

        res.locals.sfconn = sfconn;
        return next();
      }

      if (config.type === 'oauth') {
        return res.json({ success: false, failure: true, oauthrenew: true });
      }
        
      return next(new Error('Sf connection configuration type unknown'));
    }
  );
}
