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
const revealEls = document.querySelectorAll('.section-head, .price-card, .testimonial, .gallery-item, .about-text, .about-photo, .extra-services, .value-card, .faq-item, .blog-card');
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

// Contact form -> send to WhatsApp
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const OFFICE_WHATSAPP = '972544236696';
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

    const name = form.querySelector('#name').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const mail = email.value.trim();
    const message = form.querySelector('#message').value.trim();

    let text = `שלום, הגעתי דרך האתר ואשמח ליצור קשר.%0A%0A`;
    text += `*שם:* ${name}%0A`;
    text += `*טלפון:* ${phone}%0A`;
    if (mail) text += `*אימייל:* ${mail}%0A`;
    if (message) text += `*פנייה:* ${message}`;

    const url = `https://wa.me/${OFFICE_WHATSAPP}?text=${encodeURIComponent(decodeURIComponent(text))}`;
    window.open(url, '_blank', 'noopener');

    status.textContent = 'מעבירים אתכם לוואטסאפ לשליחת הפנייה...';
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

// ===== Blog article modal =====
const articleModal = document.getElementById('articleModal');
const articleContent = document.getElementById('articleContent');
const articleClose = document.getElementById('articleClose');
if (articleModal) {
    const openArticle = (id) => {
        const src = document.getElementById('src-' + id);
        if (!src) return;
        articleContent.innerHTML = src.innerHTML;
        articleContent.querySelector('h2')?.setAttribute('id', 'articleTitle');
        articleModal.classList.add('open');
        articleModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        articleModal.querySelector('.article-dialog').scrollTop = 0;
    };
    const closeArticle = () => {
        articleModal.classList.remove('open');
        articleModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    window.openArticleById = openArticle;

    document.querySelectorAll('.blog-readmore').forEach(btn => {
        btn.addEventListener('click', () => openArticle(btn.dataset.article));
    });
    articleClose.addEventListener('click', closeArticle);
    articleModal.querySelectorAll('[data-article-close]').forEach(el =>
        el.addEventListener('click', closeArticle));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && articleModal.classList.contains('open')) closeArticle();
    });
}

// ===== Blog carousel: show 3 articles, rotate every 7s =====
const blogGrid = document.getElementById('blogGrid');
if (blogGrid) {
    const BLOG_VISIBLE = 3;
    const BLOG_ROTATE_MS = 7000;
    const allCards = Array.from(blogGrid.children).map(el => el.outerHTML);
    let blogIndex = 0;
    let blogTimer = null;

    const renderBlogSlide = () => {
        const count = allCards.length;
        if (!count) return;
        const visible = Math.min(BLOG_VISIBLE, count);
        blogGrid.classList.add('fading');
        setTimeout(() => {
            blogGrid.innerHTML = '';
            for (let i = 0; i < visible; i++) {
                blogGrid.insertAdjacentHTML('beforeend', allCards[(blogIndex + i) % count]);
            }
            blogGrid.querySelectorAll('.blog-card').forEach(card => {
                card.removeAttribute('data-reveal');
                card.classList.add('visible');
            });
            blogGrid.classList.remove('fading');
        }, 400);
    };
    const stopBlogRotation = () => {
        if (blogTimer) { clearInterval(blogTimer); blogTimer = null; }
    };
    const startBlogRotation = () => {
        stopBlogRotation();
        if (allCards.length <= BLOG_VISIBLE) return;
        blogTimer = setInterval(() => {
            blogIndex = (blogIndex + BLOG_VISIBLE) % allCards.length;
            renderBlogSlide();
        }, BLOG_ROTATE_MS);
    };

    blogGrid.addEventListener('mouseenter', stopBlogRotation);
    blogGrid.addEventListener('mouseleave', startBlogRotation);

    // Delegated handler so rotating cards keep working
    blogGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.blog-readmore');
        if (btn && typeof window.openArticleById === 'function') {
            window.openArticleById(btn.dataset.article);
        }
    });

    renderBlogSlide();
    startBlogRotation();
}

