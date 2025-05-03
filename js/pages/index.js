// Array containing offer data
const offersData = [
  {
    title: 'Weekend Getaway Deal',
    description: 'Rent any SUV for the weekend and get 20% off!',
    validUntil: 'May 15, 2025',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920',
    alt: 'Offer 1',
  },
  {
    title: 'Family Vacation Package',
    description: 'Book a minivan for 5+ days and save $100.',
    validUntil: 'June 1, 2025',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920',
    alt: 'Offer 2',
  },
  {
    title: 'Sports Car Special',
    description: 'Rent a sports car for 3 days, get 1 day free!',
    validUntil: 'May 30, 2025',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920',
    alt: 'Offer 3',
  },
];

// Function to dynamically display offers
function displayOffers() {
  const offersContainer = document.querySelector('#offersContainer');
  offersContainer.innerHTML = ''; // Clear the container to avoid duplication

  offersData.forEach((offer) => {
    const offerCard = document.createElement('div');
    offerCard.className = 'col-md-4 mb-4';
    offerCard.innerHTML = `
          <div class="card offer-card">
              <img src="${offer.image}" class="card-img-top offer-img" alt="${offer.alt}">
              <div class="card-body">
                  <h5 class="card-title">${offer.title}</h5>
                  <p class="card-text">${offer.description}</p>
                  <p class="card-text"><strong>Valid until: </strong>${offer.validUntil}</p>
                  <a href="#" class="btn btn-primary">Claim Offer</a>
              </div>
          </div>
      `;
    offersContainer.appendChild(offerCard);
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the Bootstrap carousel
  var carCarousel = document.querySelector('#carCarousel');
  if (carCarousel) {
    new bootstrap.Carousel(carCarousel, {
      interval: 5000, // Slide every 5 seconds
      ride: 'carousel',
    });
  }

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

  // Display offers dynamically
  displayOffers();

  // Offer countdown and hide expired offers
  const offerCards = document.querySelectorAll('.offer-card');
  offerCards.forEach((card) => {
    const validUntilText = card
      .querySelector('.card-text strong')
      .nextSibling.textContent.trim();
    const validUntilDate = new Date(validUntilText);
    const now = new Date();

    if (validUntilDate > now) {
      const timeDiff = validUntilDate - now;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const countdown = document.createElement('p');
      countdown.className = 'card-text text-muted';
      countdown.textContent = `Hurry! ${daysLeft} days left.`;
      card.querySelector('.card-body').appendChild(countdown);
    } else {
      card.closest('.col-md-4').style.display = 'none';
    }
  });

  // Add animations to cards on scroll
  const cards = document.querySelectorAll('.card');
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

  cards.forEach((card) => observer.observe(card));
});
