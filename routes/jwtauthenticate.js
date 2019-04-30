const passport = require('passport');

module.exports = function(req, res, next) {
    passport.authenticate('jwt', {session: false}, function(err, token) {
        if (err) return next(err);
        if (!token) return res.json({ success: false, failure: true, jwtrenew: true });
        return next();
    });
}
