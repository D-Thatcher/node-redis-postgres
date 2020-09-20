require('dotenv').config();
const session = require('express-session');
const redis = require('redis');
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST, port: process.env.REDIS_PORT
});
const redisStore = require('connect-redis')(session);

function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        console.log('Missing SESSION ',req.session,req.session.user);
        console.log("REJECTED","requireLogin");

        res.redirect('/signin');
    } else {
        console.log('FOUND SESSION ',req.session);
        next();
    }
}

function requireNotLogin(req, res, next) {

    if (!req.session || !req.session.user) {
        console.log("PASSED","requireNotLogin");

        next();
    } else {
        console.log("REJECTED","requireNotLogin");
        res.redirect('/');
    }
}


// Start a session; we use Redis for the session store.
// "secret" will be used to create the session ID hash (the cookie id and th redis key value)
// "name" will show up as your cookie name in the browser
// "cookie" is provided by default; you can add it to add additional personalized options
// The "store" ttl is the expiration time for each Redis session ID, in seconds
console.log("process.env.REDIS_PORT",process.env.REDIS_PORT)
console.log("process.env.REDIS_HOST",process.env.REDIS_HOST)

const sessionHandler = (req,res,next) => session({
    secret: process.env.SESSION_SECRET,
    name: '_token',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note that the cookie-parser module is no longer needed @TODO expire the cookie d.c. with TTL redis
    store: new redisStore({ host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, client: redisClient, ttl: 86400 }),
});

module.exports={
    requireLogin,
    requireNotLogin,
    sessionHandler
};
