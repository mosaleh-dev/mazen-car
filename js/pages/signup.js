import { signup, isAdmin } from '../modules/auth.js';
import {
  attachThemeToggler,
  getQueryParam,
  showToast,
  validateForm,
} from '../utils/helpers.js';

async function signupFormHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  const formElement = event.target;
  const formData = new FormData(formElement);

  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const phoneNumber = formData.get('phoneNumber');
  const nationalId = formData.get('nationalId');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');
  const confirmPasswordInput = document.getElementById('confirm-password');

  let passwordsMatch = true;
  if (password !== passwordConfirm) {
    passwordsMatch = false;
    confirmPasswordInput.setCustomValidity('Passwords do not match!');
    confirmPasswordInput.classList.add('is-invalid');
    const feedbackDiv = confirmPasswordInput.nextElementSibling;
    if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
      feedbackDiv.textContent = 'Passwords do not match!';
    }
  } else {
    confirmPasswordInput.setCustomValidity('');
    confirmPasswordInput.classList.remove('is-invalid');
  }

  if (!validateForm(formElement) || !passwordsMatch) {
    console.log('Signup form validation failed.');
    if (!passwordsMatch) {
      confirmPasswordInput.reportValidity();
    }
    return;
  }
  try {
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

    if (signupResult.success) {
      const redirectTo = getQueryParam('redirect');
      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (isAdmin()) {
        // Should not happen for regular signup, but handle just in case
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/';
      }
    } else {
      console.error('Signup failed:', signupResult.error);
      showToast(signupResult.error, 'error', 'signup-toast');
      if (signupResult.error?.includes('Email')) {
        document.getElementById('email').classList.add('is-invalid');
        const feedbackDiv = document.getElementById('email').nextElementSibling;
        if (feedbackDiv && feedbackDiv.classList.contains('invalid-feedback')) {
          feedbackDiv.textContent = signupResult.error;
        }
      }
      formElement.classList.remove('was-validated');
    }
  } catch (error) {
    console.error('An unexpected error occurred during signup:', error);
    alert('An unexpected error occurred. Please try again later.');
    formElement.classList.remove('was-validated');
  }
}

const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', signupFormHandler);
} else {
  console.error('Signup form element not found!');
}

(() => {
  'use strict';
  attachThemeToggler();
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    const confirmPasswordInput = form.querySelector('#confirm-password');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.validity.customError) {
          confirmPasswordInput.setCustomValidity('');
        }
      });
    }
    form.querySelectorAll('input:not(#confirm-password)').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          input.classList.remove('is-invalid');
        }
      });
    });
  });
})();
