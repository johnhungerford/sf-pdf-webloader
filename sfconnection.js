var jsforce = require('jsforce');
var cv = require('./cv');
const c = require('./constants');

var conn = new jsforce.Connection({
  loginUrl : 'https://na72.salesforce.com'
});
conn.login(c.SFUSERNAME, c.SFPASSWORDTOKEN, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});


