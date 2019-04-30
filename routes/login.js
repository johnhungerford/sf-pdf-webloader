const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
        if (err) return res.json({success: false, err: err.message});
        if (!user) return res.json({success: false, err: 'Invalid user or password'});
        req.login(user, {session: false}, function(err) {
            if (err) return res.json({success: false, err: err.message});
            const token = jwt.sign(user, global.jwtSecret);
            return res.json({success: true, token: token});
        });
    })(req, res, next);
});

module.exports = router;
