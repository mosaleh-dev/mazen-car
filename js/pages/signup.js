import { signup, isLoggedIn, getCurrentUser } from '../modules/auth.js';

async function signupFormHandler(event) {
  event.preventDefault();
  console.log('Signup form submitted');
  const formElement = event.target;

  const formData = new FormData(formElement);

  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const phoneNumber = formData.get('phoneNumber');
  const nationalId = formData.get('nationalId');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');
  console.log('Attempting signup for:', email);

  const signupResult = await signup({
    firstName,
    lastName,
    phoneNumber,
    nationalId,
    email,
    password,
    passwordConfirm,
  });

  console.log('Signup result:', signupResult);

  console.log('Is logged in after signup:', isLoggedIn());
  console.log('Current user after signup:', getCurrentUser());
}

const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', signupFormHandler);
} else {
  console.error('Signup form element not found!');
}
