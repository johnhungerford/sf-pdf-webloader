const passport = require('passport');
const 

module.exports = function(req, res, next) {
    passport.authenticate('jwt', {session: false}, function(err, token) {
        if (err) return next(err);
        if (!token) return res.json({ success: false, failure: true, jwtrenew: true });
        res.locals.username = token.username;
        return next();
    });
}
