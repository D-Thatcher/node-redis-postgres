require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 2;
const {pool} = require('./config');


const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
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
  try {
    try{

      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      const qres = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [req.body.email, hashedPassword]);
      console.log('signup query ',qres)
    }
    catch (e) {
      console.log('ERROR with query',e);
      res.redirect('/login');
    }
    //Here I'm authenticating this users if
    //users exists and its pasword is correct.
    //If user verified we'll create a session
    //for this user by stroing it's information
    req.session.user = { email: req.body.email};

    console.log('session CREATED');
    res.status(201);
    res.redirect('/requiresAuth');
  }catch(e) {
    console.log('ERROR123',e);
    next(e);
  }
};



const verifyUser= async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    try{
      const qres = await pool.query('SELECT FROM users WHERE email=$1 AND password=$2', [req.body.email, hashedPassword]);
      console.log('login query ',qres)
    }
    catch (e) {
      console.log('ERROR with query',e);
      res.redirect('/signup');
    }
    req.session.user = { email: req.body.email};

    res.redirect('/requiresAuth');
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
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyUser,
  destroySession
};
