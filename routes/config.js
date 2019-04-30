const express = require('express');
const jsforce = require('jsforce');

const jwtAuthenticate = require('./jwtauthenticate');

const router = express.Router();

// GET list of sf schema configs
router.get('/sfschema', jwtAuthenticate, function(req, res, next) {
    global.mysql.getConnection((err, conn) => {
        if (err) next(err);

        // get list of sf schema configs
    });
});

// GET sf schema config
router.get('/sfschema/:param', jwtAuthenticate, function(req, res, next) {
    global.mysql.getConnection((err, conn) => {
        if (err) next(err);

        // get sf schema config
    });
});

// GET list of sf connection configs
router.get('/sfconn', jwtAuthenticate, function(req,res,next) {
    global.mysql.getConnection((err, conn) => {
        if (err) next(err);

        // get list of sf connection configs
    });
});

// GET sf connection config
router.post('/sfconn/:param', jwtAuthenticate, function(req,res,next) {
    global.mysql.getConnection((err, conn) => {
        if (err) next(err);
        // get sf connection config
        // set global.oauth2 using the settings!
    });
});

module.exports = router;
