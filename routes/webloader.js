const express = require('express');
const path = require('path');
const jsforce = require('jsforce');

const router = express.Router();

/* GET app page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(global.appRoot, 'views', 'webloader.html'));
});

module.exports = router;
