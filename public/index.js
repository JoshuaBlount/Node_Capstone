'use strict'

const userName = document.getElementById('usernameSignup');
const password = document.getElementById('passwordSignup');
const submitForm = document.getElementById('submitSignup');

function checkValidUsername(userName) {
  username.addEventListener('keyup', event => {
    isValidUsername = userName.checkValidity();

    if (isValidUsername) {
      submitForm.disabled = 'false';
    }
    else {
      submitForm.disabled = 'true';
    }
  });
};

function checkValidPassword(password) {
  password.addEventListener('keyup', event => {
    isValidPassword = password.checkValidity();

    if (isValidpasword) {
      submitForm.disabled = 'false';
    }
    else {
      submitForm.disabled = 'true';
    }
  });
};

function submitForm(submitForm) {
  submitForm.addEventListener('click', event => {
    signupForm.submit();
  });
};

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
  })
}
