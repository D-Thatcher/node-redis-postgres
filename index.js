const express = require('express');
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


var csrfProtection = csrf({ cookie: false });


const app = express();
app.use(compression());
app.use(helmet());
app.use(monitor());

app.set('view engine', 'ejs');



const isProduction = process.env.NODE_ENV === 'production';
const origin = {
    origin: isProduction ? process.env.DOMAIN : '*',
};

app.use(cors(origin));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionHandler());




app.get('/rawHTML', (req, res) => {
    return res.send('<p>No results found for "' +
        cleanHTMLString("This is where your raw user input would be returned i.e. req.body.user_input") +
        '"</p>');
});


app.get('/login', [requireNotLogin, csrfProtection], function(req, res, next) {
    res.render('login', { csrfToken: req.csrfToken() });
});


app.post('/login', [requireNotLogin, csrfProtection] ,db.verifyUser);



app.get('/', function(req, res, next) {
    res.render('index');
});


app.get('/requiresAuth', requireLogin, function(req, res, next) {
    res.render('loggedIn');
});




app.get('/signup', [requireNotLogin, csrfProtection], function(req, res, next) {
    res.render('signup', { csrfToken: req.csrfToken() });
});


app.post('/users', [requireNotLogin, csrfProtection], db.createUser);


app.get('/changePassword', [requireLogin, csrfProtection], function(req, res, next) {
    res.render('changePassword', { csrfToken: req.csrfToken() });
});

//Really a put method but express doesn't like PUT
app.post('/changePassword', [requireLogin, csrfProtection], db.updateUser);



app.get('/logout',requireLogin,db.destroySession);




const getBooks = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
};



//app.post('/books',
//    [
//    check('author').not().isEmpty().isLength({min: 5, max: 255}).trim(),
//    check('title').not().isEmpty().isLength({min: 5, max: 255}).trim(),
//    ],
//    postLimiter, addBook);



app.get('/books',
    getLimiter, getBooks);




// Log and handle unexpected errors
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Start server
app.listen(process.env.APP_PORT || 3002, () => {
    console.log(`Server listening. Visit http://localhost:`+(process.env.APP_PORT || 3002).toString())
});
