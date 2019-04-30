'use strict'
const express = require('express');
const bodyParser = require('body-parser');

const {Images} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedField = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72,
    }
  };
  const tooSmallField = Object.keys(sizedField).find(field => 'min' in sizedField[field] && req.body[field].trim().length < sizedField[field].min);
  const tooLargeField = Object.keys(sizedField).find(field => 'max' in sizedField[field] && req.body[field].trim().length > sizedField[field].max);

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
      ? `Must be at least ${sizedField[tooSmallField].min} characters long`
      : `Must be at most ${sizedField[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = ''} = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return Images.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: username
        });
      }
      return Images.hashPassword(password);
    })
    .then(hash => {
      return Images.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err)
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

router.get('/', (req, res) => {
  return Images.find()
  .then(users => res.json(users.map(user => user.serialize)))
  .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};
