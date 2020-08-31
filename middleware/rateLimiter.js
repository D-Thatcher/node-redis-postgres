const rateLimit = require('express-rate-limit');


const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
});


const getLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
});

module.exports={
    postLimiter,
    getLimiter
};
