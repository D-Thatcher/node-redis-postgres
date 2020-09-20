require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Handle errors
function logErrors (err, req, res, next) {
    console.error("Handled error in logErrors",err.stack);
    next(err)
}

function clientErrorHandler (err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' })
    } else {
        next(err)
    }
}

function errorHandler (err, req, res, next) {
    res.status(500);
    const e = isProduction? "" : err;
    // res.render('404', { error: e.stack})
    res.status(200).json({ error404: e.stack})

}

module.exports={
    logErrors,
    clientErrorHandler,
    errorHandler
};
