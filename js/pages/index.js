import { getFeaturedCars } from '../modules/data.js';
import { formatCurrency } from '../utils/helpers.js';

//TODO: add offers page and offers managment
const offersData = [
  {
    title: 'Weekend Getaway Deal',
    description: 'Rent any SUV for the weekend and get 20% off!',
    validUntil: 'May 15, 2025',
    image: 'https://placehold.co/300x200.webp?text=Offer+SUV',
    alt: 'Weekend SUV Offer',
    link: '#',
  },
  {
    title: 'Family Vacation Package',
    description: 'Book a minivan for 5+ days and save E£100.',
    validUntil: 'June 1, 2025',
    image: 'https://placehold.co/300x200.webp?text=Offer+Van',
    alt: 'Family Van Package',
    link: '#',
  },
  {
    title: 'Sports Car Special',
    description: 'Rent a sports car for 3 days, get 1 day free!',
    validUntil: 'May 30, 2025',
    image: 'https://placehold.co/300x200.webp?text=Offer+Sports',
    alt: 'Sports Car Special',
    link: '#',
  },
];

async function displayFeaturedCars() {
  const featuredContainer = document.querySelector(
    '#featured-vehicles-container'
  );
  if (!featuredContainer) return;

  featuredContainer.innerHTML = '';

  try {
    const featuredCars = await getFeaturedCars();
    const chunkSize = 3;

    if (featuredCars.length === 0) {
      featuredContainer.innerHTML = `
        <div class="carousel-item active">
          <div class="alert alert-info w-100 text-center">No featured cars available right now. <a href="cars.html">Browse all cars</a>.</div>
        </div>`;
      document
        .querySelectorAll(
          '#carCarousel .carousel-control-prev, #carCarousel .carousel-control-next'
        )
        .forEach((btn) => (btn.style.display = 'none'));
      return;
    }

    for (let i = 0; i < featuredCars.length; i += chunkSize) {
      const chunk = featuredCars.slice(i, i + chunkSize);
      const isActive = i === 0 ? 'active' : '';
      const slideFragment = document.createDocumentFragment();
      const slideDiv = document.createElement('div');
      slideDiv.className = `carousel-item ${isActive}`;
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';

      chunk.forEach((car) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-4 mb-4';
        colDiv.innerHTML = `
          <div class="card h-100 car-card">
            <img src="${car.imageUrl || 'https://placehold.co/300x200.webp?text=No+Image'}" class="card-img-top" alt="${car.brand} ${car.model}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${car.brand} ${car.model}</h5>
              <p class="card-text"><span class="badge bg-secondary">${car.type}</span></p>
              <p class="card-text mt-auto pt-2">
                <span class="price fs-5">E£${formatCurrency(car.rentPerDay)}</span> / day
              </p>
              <a href="car.html?id=${car.id}" class="btn btn-primary mt-2 stretched-link">View Details</a>
            </div>
          </div>
        `;
        rowDiv.appendChild(colDiv);
      });

      const remainingCols = chunkSize - chunk.length;
      for (let j = 0; j < remainingCols; j++) {
        const emptyColDiv = document.createElement('div');
        emptyColDiv.className = 'col-md-4 mb-4';
        rowDiv.appendChild(emptyColDiv);
      }

      slideDiv.appendChild(rowDiv);
      slideFragment.appendChild(slideDiv);
      featuredContainer.appendChild(slideFragment);
    }

    if (featuredCars.length <= chunkSize) {
      document
        .querySelectorAll(
          '#carCarousel .carousel-control-prev, #carCarousel .carousel-control-next'
        )
        .forEach((btn) => (btn.style.display = 'none'));
    } else {
      document
        .querySelectorAll(
          '#carCarousel .carousel-control-prev, #carCarousel .carousel-control-next'
        )
        .forEach((btn) => (btn.style.display = 'block'));
    }
  } catch (error) {
    console.error('Error fetching or displaying featured cars:', error);
    featuredContainer.innerHTML = `
      <div class="carousel-item active">
        <div class="alert alert-danger w-100 text-center">Could not load featured cars. Please try again later.</div>
      </div>`;
    document
      .querySelectorAll(
        '#carCarousel .carousel-control-prev, #carCarousel .carousel-control-next'
      )
      .forEach((btn) => (btn.style.display = 'none'));
  }
}

function displayOffers() {
  const offersContainer = document.querySelector('#offersContainer');
  if (!offersContainer) return;
  offersContainer.innerHTML = '';

  if (offersData.length === 0) {
    offersContainer.innerHTML =
      '<div class="col"><div class="alert alert-info">No special offers available at the moment.</div></div>';
    return;
  }

  offersData.forEach((offer) => {
    const offerCard = document.createElement('div');
    offerCard.className = 'col-md-4 mb-4';
    offerCard.innerHTML = `
          <div class="card offer-card h-100">
              <img src="${offer.image}" class="card-img-top offer-img" alt="${offer.alt}">
              <div class="card-body d-flex flex-column"> <!-- Added flex classes -->
                  <h5 class="card-title">${offer.title}</h5>
                  <p class="card-text">${offer.description}</p>
                  <p class="card-text"><small class="text-muted">Valid until: ${offer.validUntil}</small></p>
                  <a href="${offer.link}" class="btn btn-primary mt-auto">Claim Offer</a>
              </div>
          </div>
      `;
    offersContainer.appendChild(offerCard);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var carCarouselElement = document.querySelector('#carCarousel');
  var carouselInstance = null;
  if (carCarouselElement) {
    carouselInstance = new bootstrap.Carousel(carCarouselElement, {
      interval: 5000,
      ride: false,
      wrap: true,
    });
  }

  document.querySelectorAll('.nav-link[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navbarHeight =
          document.querySelector('.navbar')?.offsetHeight || 70;
        window.scrollTo({
          top: targetElement.offsetTop - navbarHeight,
          behavior: 'smooth',
        });
      }
    });
  });

  displayFeaturedCars().then(() => {
    if (carouselInstance) {
      carouselInstance.cycle();
    }
  });

  displayOffers();

  const offerCards = document.querySelectorAll('#offersContainer .offer-card');
  offerCards.forEach((card) => {
    const validUntilElement = card.querySelector('.card-text small');
    if (!validUntilElement) return;

    const validUntilText = validUntilElement.textContent
      .replace('Valid until: ', '')
      .trim();
    try {
      const validUntilDate = new Date(validUntilText);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (validUntilDate >= now) {
        // Show if valid today or in the future
        const timeDiff = validUntilDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const countdown = document.createElement('p');
        countdown.className = 'card-text text-muted small mt-2';
        if (daysLeft === 0) {
          countdown.textContent = `Ends today!`;
        } else if (daysLeft === 1) {
          countdown.textContent = `Ends tomorrow!`;
        } else {
          countdown.textContent = `Ends in ${daysLeft} days.`;
        }

        card
          .querySelector('.card-body')
          .insertBefore(countdown, card.querySelector('.btn-primary'));
      } else {
        card.closest('.col-md-4').style.display = 'none';
      }
    } catch (e) {
      console.error('Error parsing date for offer:', validUntilText, e);
      card.closest('.col-md-4').style.display = 'none';
    }
  });

  const cardsToAnimate = document.querySelectorAll('.card');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cardsToAnimate.forEach((card) => observer.observe(card));
});
