const express = require('express');
const jsforce = require('jsforce');

const jwtAuthenticate = require('./jwtauthenticate');

const router = express.Router();

// GET a list of sf schema configs
router.get('/sfschema/:sfconnid', jwtAuthenticate, function(req, res, next) {
    console.log('hello????');
    console.log(`/config/sfschema/${req.params.sfconnid}`);
    console.log(res.locals);
    global.mysql.query(
        `SELECT default_sfschema FROM sfconnections WHERE id=${req.params.sfconnid}`,
        (err, resDefault) => {
            console.log(`resDefault:`);
            console.log(resDefault);
            if (err) return res.json({
                success: false,
                message: 'attempt to query default connection failed',
            });

            let outObj = {};
            if (resDefault.length > 0) outObj.default = resDefault[0].default_sfschema;
            
            global.mysql.query(
                `SELECT id, title, config FROM sfschemas WHERE (user=${res.locals.id} OR user IS NULL) AND sfconnection=${req.params.sfconnid}`, 
                (err2, resQuery)=>{
                    if (err2) {
                        console.log(err2);
                        return res.json({
                            success: false,
                            message: 'attempt to query sf schema configs failed',
                        });
                    }
        
                    console.log('no error...');
                    console.log(resQuery);

                    outObj.success = true;
                    if (resQuery.length === 0) {
                        outObj.list = [];
                        return res.json(outObj);
                    }

                    outObj.list = resQuery.map((val, index)=>{
                        if (val.id = outObj.default) outObj.dm = val.config;
                        return {
                            title: val.title,
                            id: val.id
                        };
                    });
                    
                    return res.json(outObj);
                }
            );
        }
    );
});

// choose a sf schema config
router.get('/sfschema/:sfconnid/:schemaid', jwtAuthenticate, function(req, res, next) {
    global.mysql.query(
        `SELECT config FROM sfschemas WHERE sfconnection=${req.params.sfconnid} AND id=${req.params.schemaid}`,
        (err, result) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'attempt to query sf schema config failed',
                });
            }
            
            console.log('no error');
            if (result.length !== 1) {
                return res.json({
                    success: false,
                    message: 'unexpected number of records...',
                });
            }

            req.session.sfauthcode = null;
            req.session.instanceUrl = null;
            req.session.accessToken = null;
            req.session.refreshToken = null;
            return res.json({
                success: true,
                config: result[0].config,
            })
        }
    );
});

// GET list of sf connection configs
router.get('/sfconn', jwtAuthenticate, function(req,res,next) {
    console.log(`/config/sfconn: ${res.locals.username}`);

    global.mysql.query(
        `SELECT default_conn FROM users WHERE id=${res.locals.id}`,
        (err, resDefault) => {
            console.log(`resDefault:`);
            console.log(resDefault);
            if (err) return res.json({
                success: false,
                message: 'attempt to query default connection failed',
            });

            let outObj = {};
            if (resDefault.length > 0) outObj.default = resDefault[0].default_conn;

            global.mysql.query(
                `SELECT id, title FROM sfconnections WHERE user=${res.locals.id} OR user IS NULL`, 
                (err2, resQuery)=>{
                    if (err2) {
                        return res.json({
                            success: false,
                            message: 'attempt to query sf connection configs failed',
                        });
                    }

                    outObj.success = true;
                    if (resQuery.length === 0) {
                        outObj.list = [];
                        return res.json(outObj);
                    }

                    outObj.list = resQuery.map((val, index)=>{
                        return {
                            title: val.title,
                            id: val.id
                        };
                    });

                    console.log(outObj);
                    return res.json(outObj);
                }
            );
        }
    );       
});

router.post('/addsfconn', jwtAuthenticate, function (req, res, next) {
    console.log(`/addsfconn; username: ${res.locals.username}`);
    global.mysql.query(
        `INSERT INTO sfconnections SET ?`, 
        {
            user: res.locals.id,
            title: req.body.title,
            config: req.body.config,
        },
        (errQuery, resQuery)=>{
            if (errQuery) {
                return res.json({
                    success: false,
                    message: 'attempt to query sf connection configs failed',
                    err: errQuery,
                });
            }

            if (req.body.default === true) {
                global.mysql.query(
                    `UPDATE users SET default_conn=${resQuery.id} WHERE id=${res.locals.id}`, 
                    (errQuery2, resQuery2)=>{
                        if (errQuery2) {
                            return res.json({
                                success: false,
                                message: 'attempt to set default failed',
                                err: errQuery2,
                            });
                        }
            
                        return res.json({ 
                            success: true, 
                            data: resQuery,
                        });
                    }
                );    

                return;
            }

            return res.json({ 
                success: true, 
                data: resQuery,
            });
        }
    );    
});

router.post('/addsfschema', jwtAuthenticate, function (req, res, next) {
    console.log(`/addsfschema; username: ${res.locals.username}`);
    global.mysql.query(
        `INSERT INTO sfschemas SET ?`, 
        {
            user: res.locals.id,
            sfconnection: req.body.sfconnid,
            title: req.body.title,
            config: req.body.config,
        },
        (errQuery, resQuery)=>{
            if (errQuery) {
                return res.json({
                    success: false,
                    message: 'attempt to query sf connection configs failed',
                    err: errQuery,
                });
            }

            return res.json({ 
                success: true, 
                data: resQuery,
            });
        }
    );  
});

module.exports = router;
