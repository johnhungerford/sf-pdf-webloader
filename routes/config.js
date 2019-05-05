const express = require('express');
const jsforce = require('jsforce');

const jwtAuthenticate = require('./jwtauthenticate');

const router = express.Router();

// GET a list of schemata config
router.get('/sfschema/:sfconnid', jwtAuthenticate, function(req, res, next) {
    console.log('hello????');
    console.log(`/config/sfschema/${req.params.sfconnid}`);
    console.log(res.locals);
    global.mysql.query(
        `SELECT id, title FROM sfschemas WHERE user=${res.locals.id} AND sfconnection=${req.params.sfconnid}`, 
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
            if (resQuery.length === 0) {
                return res.json({
                    success: true,
                    list: [],
                });
            }

            console.log()
            const configList = resQuery.map((val, index)=>{
                return {
                    title: val.title,
                    id: val.id
                };
            });

            return res.json({ 
                success: true, 
                list: configList,
            });
        }
    );
});

// GET a schema
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

            console.log(result[0].config.slice(result[0].config.length - 10, result[0].config.length));
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
        `SELECT id, title FROM sfconnections WHERE user=${res.locals.id}`, 
        (err2, resQuery)=>{
            if (err2) {
                return res.json({
                    success: false,
                    message: 'attempt to query sf connection configs failed',
                });
            }

            if (resQuery.length === 0) {
                return res.json({
                    success: true,
                    list: [],
                });
            }

            const configList = resQuery.map((val, index)=>{
                return {
                    title: val.title,
                    id: val.id
                };
            });

            console.log(configList);
            return res.json({ 
                success: true, 
                list: configList,
            });
        }
    );       
});

module.exports = router;
