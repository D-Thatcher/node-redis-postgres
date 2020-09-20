require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 2;
const {pool} = require('./config');


const getUsers = async (request, response, next) => {
  // pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
  //   if (error) {
  //     throw error
  //   }
  //   response.status(200).json(results.rows)
  // });
  const results = await pool.query('SELECT * FROM users ORDER BY id ASC');
  response.status(200).json(results.rows)

};

const dbTest = (request, response, next) => {
  const {main} = require("./test_connection2")
  main()
      .then (() => {
        console.error('Done');
        response.status(200).json({nothing:true})
      })
      .catch((err) => {
        console.error('Error: %s', err);
        console.error('Error: %s', err.stack);
        response.status(200).json({nothing:false})
      });

};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);
  if (isNaN(id)){return response.status(404).send("<div>Oops... can't find that one</div>")}

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
};


const createUser= async (req, res, next) => {
  console.log('CREATE USER',req.body)
  console.log(' INSIDE createUser',req.body.email_or_pn,req.body.password)

  try {

    try{

      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log('hashedPassword',hashedPassword)

      const qres = await pool.query('INSERT INTO users (email_or_pn, first_name, last_name, password) VALUES ($1, $2, $3, $4)',
          [req.body.email_or_pn, req.body.firstName, req.body.lastName, hashedPassword]);
      console.log('signup query ',qres)
    }
    catch (e) {
      console.log('ERROR with query',e);
      res.redirect('/signin');
    }
    req.session.user = { email_or_pn: req.body.email_or_pn, first_name: req.body.firstName, last_name: req.body.lastName};

    console.log('session CREATED');
    res.status(201);
    res.redirect('/dashboard');
  }catch(e) {
    console.log('ERROR123',e);
    next(e);
  }
};



const verifyUser= async (req, res, next) => {
  console.log(' INSIDE verifyUser',req.body.email_or_pn,req.body.password)

  try {



    try{
      const qres = await pool.query('SELECT * FROM users WHERE email_or_pn=$1', [req.body.email_or_pn]);
      console.log('verifyUser qres',qres)
      if (qres && qres.rows){
        if (qres.rows.length === 1){
          const user_with_email_or_pn = qres.rows[0];
          // Do the passwords match?
          console.log('(req.body.password, user_with_email_or_pn.password)',req.body, user_with_email_or_pn)
          const match = await bcrypt.compare(req.body.password, user_with_email_or_pn.password);
          console.log('They matched',match);
          if(match){
            console.log('req.session.user BEFORE',req.session.user)
            req.session.user = { email_or_pn: req.body.email_or_pn, first_name: user_with_email_or_pn.first_name,};
            console.log('req.session.user AFTER',req.session.user)
            res.redirect('/dashboard');
          }
          else{
            res.locals.message = 'Wrong username or password';
            next()
            //res.status(404).json({message:'Wrong username or password'});
          }
        }
        else{
          res.locals.message = 'Wrong username or password';
          next()
          //res.status(404).json({message:'Wrong username or password'});
        }
      }
      // Todo use response to get user first name
      console.log('login query ',qres)
    }
    catch (e) {
      console.log('ERROR with query',e);
      res.redirect('/signup');
    }
  }catch(e) {
    console.log('ERROR123',e);
    next(e);
  }

};

const destroySession= async (req, res, next) => {
  console.log('trying to log out');
  if(req.session) {
    req.session.destroy(function(){
      console.log('logged out');
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
};





const updateUser = async (req, res, next) => {
console.log(req.body,req.session.user.email,req.session);
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const hashedNewPassword = await bcrypt.hash(req.body.password, saltRounds);

    const qr = pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 AND password = $3 RETURNING * ',
        [hashedNewPassword, req.session.user.email, hashedPassword]);
    res.status(200);
    res.redirect('/');
  }
  catch (e) {
    res.status(200);
    res.redirect('/404',{error:e.stack});
  }
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
};

module.exports = {
  dbTest,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  destroySession
};
