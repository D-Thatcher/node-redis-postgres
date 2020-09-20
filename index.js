const express = require('express');
const next = require('next')

const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const {body, check,validationResult} = require('express-validator');
const {pool} = require('./config');
var csrf = require('csurf');
var methodOverride = require('method-override');
const {cleanHTMLString} = require('./Sanitizer');
const {requireLogin,requireNotLogin,sessionHandler} = require('./middleware/auth');
const {postLimiter,getLimiter} = require('./middleware/rateLimiter');
const {logErrors, clientErrorHandler, errorHandler} =  require('./middleware/errorHandler');
const {monitor} =  require('./middleware/monitor');
const db = require('./queries');

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const next_module = next({ dev })
const next_handle = next_module.getRequestHandler()
const crypto = require("crypto");

//
var csrfProtection = csrf({ cookie: false });

const isProduction = process.env.NODE_ENV === 'production';
const origin = {
    origin: isProduction ? process.env.DOMAIN : '*',
};


next_module.prepare().then(() => {
    let app = express();
    app.use(compression());
    app.use(helmet());

    app.use((req, res, next) => {
        res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
        // res.locals.cspNonceStyle = crypto.randomBytes(16).toString("hex");

        const cspMiddleware = helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'","'unsafe-eval'", `'nonce-${res.locals.cspNonce}'`],
                styleSrc: ["'self'","'unsafe-inline'"]//, `'nonce-${res.locals.cspNonceStyle}'`],


            },
        });
        cspMiddleware(res, res, next);
    });



    app.use(monitor());
    //
    //
    app.use(cors(origin));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(sessionHandler());




    app.get('/a', (req, res) => {
        return next_module.render(req, res, '/a', req.query)
    })

    app.get('/b', (req, res) => {
        return next_module.render(req, res, '/b', req.query)
    });

    app.get('/pricing', (req, res) => {
        console.log("PRICING")
        return next_module.render(req, res, '/pricing', req.query)
    })

    app.get('/signin', [requireNotLogin, csrfProtection], function(req, res, next) {
        return next_module.render(req,res,'/signin', { csrfToken: req.csrfToken() });
    });

    app.post('/signin', [requireNotLogin, csrfProtection] ,db.verifyUser);


    app.get('/signup', [requireNotLogin, csrfProtection], function(req, res, next) {
        return next_module.render(req,res,'/signup', { csrfToken: req.csrfToken() });
    });

    app.get('/forgotPassword', [requireNotLogin, csrfProtection], function(req, res, next) {
        return next_module.render(req,res,'/forgotPassword', { csrfToken: req.csrfToken() });
    });

    app.get('/changePassword', [requireLogin, csrfProtection], function(req, res, next) {
        return next_module.render(req,res,'/changePassword', { csrfToken: req.csrfToken() });
    });


    app.post('/users', [requireNotLogin, csrfProtection], db.createUser);

    app.get('/allUsers', db.getUsers);

    app.get('/dashboard',[requireLogin,csrfProtection], function(req, res, next) {
        return next_module.render(req,res,'/dashboard', { csrfToken: req.csrfToken(), first_name: req.session.user.first_name });
    });

    app.get('/logout',requireLogin,db.destroySession);



    // Log and handle unexpected errors
    app.use(methodOverride());
    app.use(logErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);

    app.all('*', (req, res) => {
        return next_handle(req, res)
    })

    app.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })
})




// app.get('/rawHTML', (req, res) => {
//     return res.send('<p>No results found for "' +
//         cleanHTMLString("This is where your raw user input would be returned i.e. req.body.user_input") +
//         '"</p>');
// });






//
// app.get('/changePassword', [requireLogin, csrfProtection], function(req, res, next) {
//     res.render('changePassword', { csrfToken: req.csrfToken() });
// });
//
// //Really a put method but express doesn't like PUT
// app.post('/changePassword', [requireLogin, csrfProtection], db.updateUser);
//
//
//




// const getBooks = (request, response) => {
//     pool.query('SELECT * FROM users', (error, results) => {
//         if (error) {
//             throw error
//         }
//         response.status(200).json(results.rows)
//     })
// };



//app.post('/books',
//    [
//    check('author').not().isEmpty().isLength({min: 5, max: 255}).trim(),
//    check('title').not().isEmpty().isLength({min: 5, max: 255}).trim(),
//    ],
//    postLimiter, addBook);

//
//
// app.get('/books',
//     getLimiter, getBooks);



