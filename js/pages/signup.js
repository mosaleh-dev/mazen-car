import {
  signup,
  isLoggedIn,
  getCurrentUser,
  isAdmin,
} from '../modules/auth.js';

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

  // التحقق من تكرار الإيميل من localStorage
  const storedEmails = JSON.parse(localStorage.getItem('emails') || '[]');

  if (storedEmails.includes(email)) {
    alert('الإيميل ده متسجل بالفعل!');
    return;
  }

  if (
    firstName &&
    lastName &&
    phoneNumber &&
    nationalId &&
    email &&
    password &&
    passwordConfirm
  ) {
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

    storedEmails.push(email);
    localStorage.setItem('emails', JSON.stringify(storedEmails));

    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get('redirect');
    const currentPath = window.location.pathname;

    if (isLoggedIn()) {
      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (isAdmin()) {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/';
      }
    } else {
      if (currentPath === '/signup.html' || currentPath === '/login.html') {
        const referrerPath = document.referrer
          ? new URL(document.referrer).pathname
          : '/';
        const newUrl = `${currentPath}?redirect=${referrerPath}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }

  console.log('Is logged in after signup:', isLoggedIn());
  console.log('Current user after signup:', getCurrentUser());
}

const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', signupFormHandler);
} else {
  console.error('Signup form element not found!');
}

(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirm-password');

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (password.value !== confirmPassword.value) {
        event.preventDefault();
        event.stopPropagation();
        confirmPassword.setCustomValidity('Passwords do not match!');
        confirmPassword.nextElementSibling.textContent =
          'Passwords do not match!';
      } else {
        confirmPassword.setCustomValidity('');
      }

      form.classList.add('was-validated');
    });
  });
})();
