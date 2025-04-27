import { getCurrentUser, isLoggedIn, login } from '../modules/auth.js';

async function loginFormHandler(event) {
  event.preventDefault();
  console.log('form login');
  const formElement = event.target;
  const formData = new FormData(formElement);
  const email = formData.get('email');
  const password = formData.get('password');
  await login(email, password);
  console.log('is loggedin', isLoggedIn());
  console.log('current user', getCurrentUser());
}
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', loginFormHandler);
} else {
  console.error('Login form element not found!');
}
