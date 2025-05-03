import { isLoggedIn, login, isAdmin, logout } from '../modules/auth.js';

async function loginFormHandler(event) {
  event.preventDefault();
  logout();

  const formElement = event.target;
  const formData = new FormData(formElement);
  const email = formData.get('email');
  const password = formData.get('password');
  let log = await login(email, password);

  if (log.success == true && isAdmin()) {
    location.href = '/admin-dashboard.html';
  } else if (log.success == true && !isAdmin()) {
    location.href = '/';
  } else {
    alert('login failed');
  }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', loginFormHandler);
} else {
  console.error('Login form element not found!');
}

(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });
  });
})();
