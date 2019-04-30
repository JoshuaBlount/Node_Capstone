'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const {router: imageRouter} = require('./images');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const app = express();
const config = {
  autoIndex: false,
  useNewUrlParser: true,
};

// Logging
app.use(morgan('common'));
// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/images', imageRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

mongoose.connect(DATABASE_URL, config).then(() => console.log('Connected to DB'))
.catch(() => 'Error: Could not connect to DB');

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
})

// if (require.main === module) {
//   runServer().catch(err => console.error(err));
// }

module.exports = { app };
