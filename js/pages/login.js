import { login, logout } from '../modules/auth.js';
import { attachThemeToggler, validateForm } from '../utils/helpers.js';
import { getQueryParam } from '../utils/helpers.js';

async function loginFormHandler(event) {
  event.preventDefault();
  event.stopPropagation();
  logout();

  const formElement = event.target;
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!validateForm(formElement)) {
    console.log('Login form validation failed');
    return;
  }

  try {
    const log = await login(email, password);
    const redirectTarget = getQueryParam('redirect');

    if (log.success) {
      if (redirectTarget) {
        window.location.href = redirectTarget;
      } else if (log.isAdmin) {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/';
      }
    } else {
      console.warn(
        'Login failed:',
        email,
        password,
        log.error || 'Invalid credentials'
      );
      passwordInput.classList.add('is-invalid');
      const feedbackDiv = passwordInput.nextElementSibling;
      if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
        feedbackDiv.textContent = log.error || 'Invalid email or password.';
      } else {
        alert(
          log.error || 'Login failed. Please check your email and password.'
        );
      }
      formElement.classList.remove('was-validated');
    }
  } catch (error) {
    console.error('An unexpected error occurred during login:', error);
    alert('An unexpected error occurred. Please try again later.');
    formElement.classList.remove('was-validated');
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
  attachThemeToggler();
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          input.classList.remove('is-invalid');
          const feedbackDiv = input.nextElementSibling;
        }
      });
    });
  });
})();
