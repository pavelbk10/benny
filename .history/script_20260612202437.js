// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Header shadow on scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.section-head, .price-card, .testimonial, .gallery-item, .about-text, .about-photo, .extra-services');
revealEls.forEach(el => el.setAttribute('data-reveal', ''));
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// Contact form validation + feedback
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid');
            valid = false;
        } else {
            field.classList.remove('invalid');
        }
    });

    const email = form.querySelector('#email');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('invalid');
        valid = false;
    }

    if (!valid) {
        status.textContent = 'נא למלא את כל שדות החובה כראוי.';
        status.style.color = '#e05252';
        return;
    }

    status.textContent = 'תודה! הפנייה נשלחה ונחזור אליך בהקדם.';
    status.style.color = '#1b7a4b';
    form.reset();
});
