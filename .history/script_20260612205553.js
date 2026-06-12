// Current year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Header shadow on scroll
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// Mobile navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
}

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
if (form) {
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
}

// ===== Accessibility widget =====
const a11yToggle = document.getElementById('a11yToggle');
const a11yPanel = document.getElementById('a11yPanel');
const a11yClose = document.getElementById('a11yClose');
const a11yReset = document.getElementById('a11yReset');
const root = document.documentElement;

if (a11yToggle) {
    const openPanel = () => {
        a11yPanel.classList.add('open');
        a11yPanel.setAttribute('aria-hidden', 'false');
        a11yToggle.setAttribute('aria-expanded', 'true');
    };
    const closePanel = () => {
        a11yPanel.classList.remove('open');
        a11yPanel.setAttribute('aria-hidden', 'true');
        a11yToggle.setAttribute('aria-expanded', 'false');
    };

    a11yToggle.addEventListener('click', () => {
        a11yPanel.classList.contains('open') ? closePanel() : openPanel();
    });
    a11yClose.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

    // Persist state
    let fontStep = 0;
    const saved = JSON.parse(localStorage.getItem('a11y') || '{}');

    const applyState = (state) => {
        const toggles = ['contrast', 'invert', 'grayscale', 'readable', 'spacing', 'links', 'cursor', 'stop-motion'];
        toggles.forEach(key => {
            const on = !!state[key];
            root.classList.toggle('acc-' + key, on);
            const btn = document.querySelector(`[data-a11y="${key}"]`);
            if (btn) btn.classList.toggle('active', on);
        });
        fontStep = state.fontStep || 0;
        root.style.fontSize = fontStep ? `${100 + fontStep * 10}%` : '';
    };

    const saveState = () => {
        const state = { fontStep };
        ['contrast', 'invert', 'grayscale', 'readable', 'spacing', 'links', 'cursor', 'stop-motion'].forEach(key => {
            state[key] = root.classList.contains('acc-' + key);
        });
        localStorage.setItem('a11y', JSON.stringify(state));
    };

    applyState(saved);

    document.querySelectorAll('[data-a11y]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.a11y;
            if (action === 'font-up') {
                fontStep = Math.min(fontStep + 1, 5);
                root.style.fontSize = `${100 + fontStep * 10}%`;
            } else if (action === 'font-down') {
                fontStep = Math.max(fontStep - 1, -2);
                root.style.fontSize = fontStep ? `${100 + fontStep * 10}%` : '';
            } else {
                const cls = 'acc-' + action;
                const on = root.classList.toggle(cls);
                btn.classList.toggle('active', on);
            }
            saveState();
        });
    });

    a11yReset.addEventListener('click', () => {
        ['contrast', 'invert', 'grayscale', 'readable', 'spacing', 'links', 'cursor', 'stop-motion'].forEach(key => {
            root.classList.remove('acc-' + key);
        });
        document.querySelectorAll('[data-a11y]').forEach(b => b.classList.remove('active'));
        fontStep = 0;
        root.style.fontSize = '';
        localStorage.removeItem('a11y');
    });
}
