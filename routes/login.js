const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/', function(req, res, next) {
    console.log('Logging in...');
    console.log(req.session);

    if (req.body.logout) {
        delete req.session.webloadertoken;
        return res.json({ success: true });
    }

    if (req.session.webloadertoken) {
        jwt.verify(
            req.session.webloadertoken, 
            global.jwtSecret, 
            {
                algorithms: 'HS256',
                maxAge: '3h',
            },
            (err, decoded)=>{
                console.log('decoded?',err,decoded);
                if (err) return authCredentials();
                console.log('Authenticated jwt: ', decoded);
                res.json({success: true, username: decoded.username});
            }
        );

        return;
    }

    authCredentials();

    function authCredentials () {
        console.log('authenticating credentials');
        const username = req.body.username;
        const password = req.body.password;
        console.log(`username: ${username}; password: ${password}`);


        if (username === undefined || password === undefined) {
            return res.json({
                success: false,
                message: 'missing username or password',
            });
        }

        global.mysql.query(`SELECT * FROM users WHERE username="${username}"`, function (err2, resQuery) {
            if (err2) {
                return res.json({
                    success: false,
                    message: 'unable to query credentials',
                });
            }

            console.log('queried: ', resQuery);
            if (resQuery.length === 0) {
                return res.json({
                    success: false,
                    message: 'invalid username or password',
                });
            }

            bcrypt.compare(password, resQuery[0].password, (err3, resBcrypt) => {
                if (err3) {
                    return res.json({
                        success: false,
                        message: 'unable to perform encryption comparison',
                    });
                }

                console.log('bcrypted: ', resBcrypt);
                if (resBcrypt) {
                    console.log('bcrypt success callback');
                    jwt.sign(
                        { 
                            username: username,
                            id: resQuery[0].id, 
                        }, 
                        global.jwtSecret,
                        { expiresIn: '3h' },
                        (err4, token) => {
                            if (err4) {
                                return res.json({
                                    success: false,
                                    message: 'unable to generate token',
                                });
                            }

                            console.log('ID ... ' + resQuery[0].id);
                            req.session.webloadertoken = token;
                            return res.json({
                                success: true,
                                username: username,
                                id: resQuery[0].id,
                            });
                        }
                    );

                    return;
                }

                return res.json({
                    success: false,
                    message: 'invalid username or password',
                });
            });
        });
    }
});

module.exports = router;
