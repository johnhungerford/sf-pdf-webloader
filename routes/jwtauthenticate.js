const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.session.webloadertoken;
    if (token === undefined || token === null) {
        return res.json({
            success: false, 
            wlreauth: true, 
            message: 'no token'
        });
    }

    jwt.verify(
        token, 
        global.jwtSecret, 
        {
            algorithms: 'HS256',
            maxAge: '3h',
        },
        (err, decoded)=>{
            if (err) return res.json({
                success: false, 
                wlreauth: true, 
                message: `bad token: ${err.message}`
            });
            
            console.log('Authenticated jwt: ', decoded);
            res.locals.username = decoded.username;
            res.locals.id = decoded.id;
            return next();
        });
}
