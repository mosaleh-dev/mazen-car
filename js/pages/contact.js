// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  // Smooth scrolling for navigation links
  document.querySelectorAll('.nav-link').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70, // Adjust for navbar height
            behavior: 'smooth',
          });
        }
      }
    });
  });

  // Handle contact form submission
  const contactForm = document.querySelector('#contactForm');
  const formMessage = document.querySelector('#formMessage');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default form submission

      // Get form values
      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const subject = document.querySelector('#subject').value.trim();
      const message = document.querySelector('#message').value.trim();

      // Basic validation
      if (name && email && subject && message) {
        // Simulate form submission (replace with actual backend API call)
        formMessage.innerHTML =
          '<div class="alert alert-success">Thank you! Your message has been sent.</div>';
        contactForm.reset(); // Clear the form
      } else {
        formMessage.innerHTML =
          '<div class="alert alert-danger">Please fill in all fields.</div>';
      }

      // Clear message after 3 seconds
      setTimeout(() => {
        formMessage.innerHTML = '';
      }, 3000);
    });
  }

  // Add animations to form, contact info, and team cards on scroll
  const animatedElements = document.querySelectorAll('.col-md-6, .team-card');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
        }
      });
    },
    { threshold: 0.2 }
  );

  animatedElements.forEach((element) => observer.observe(element));
});
