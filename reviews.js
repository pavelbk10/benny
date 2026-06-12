// ============================================================
//  ניהול המלצות לקוחות – טעינה ושמירה (Firebase Firestore)
//  אם אין הגדרת Firebase תקינה, נופלים חזרה ל-localStorage.
// ============================================================

const cfg = window.firebaseConfig || {};
const hasFirebase = cfg.apiKey && cfg.apiKey !== 'REPLACE_ME';

const grid = document.getElementById('testimonialsGrid');
const modal = document.getElementById('reviewModal');
const openBtn = document.getElementById('openReviewBtn');
const closeBtn = document.getElementById('reviewClose');
const formEl = document.getElementById('reviewForm');
const statusEl = document.getElementById('reviewStatus');
const submitBtn = document.getElementById('reviewSubmit');

let db = null;
let firestore = null;

// --- אתחול Firebase (דינמי, רק אם יש הגדרה) ---
async function initFirebase() {
    if (!hasFirebase) return;
    try {
        const appMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        firestore = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        const app = appMod.initializeApp(cfg);
        db = firestore.getFirestore(app);
    } catch (err) {
        console.warn('Firebase init failed, falling back to localStorage', err);
        db = null;
    }
}

// --- עזרי תצוגה ---
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function buildCard({ name, role, rating, text }) {
    const article = document.createElement('article');
    article.className = 'testimonial';
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const initial = (name || '?').trim().charAt(0);
    article.innerHTML = `
        <div class="stars">${stars}</div>
        <p>"${escapeHtml(text)}"</p>
        <div class="testimonial-author">
            <span class="avatar">${escapeHtml(initial)}</span>
            <div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(role || 'לקוח/ה')}</small></div>
        </div>`;
    return article;
}

// --- קרוסלה: הצגת 3 המלצות שמתחלפות כל 5 שניות ---
const VISIBLE = 3;
const ROTATE_MS = 5000;
let allReviews = [];
let rotateIndex = 0;
let rotateTimer = null;

function parseStaticCard(article) {
    const starsText = article.querySelector('.stars')?.textContent || '';
    const rating = (starsText.match(/★/g) || []).length || 5;
    const text = (article.querySelector('p')?.textContent || '').replace(/^["“”]|["“”]$/g, '').trim();
    const name = article.querySelector('.testimonial-author strong')?.textContent.trim() || '';
    const role = article.querySelector('.testimonial-author small')?.textContent.trim() || '';
    return { name, role, rating, text };
}

function renderSlide() {
    const count = allReviews.length;
    if (!count) return;
    const visible = Math.min(VISIBLE, count);
    grid.classList.add('fading');
    setTimeout(() => {
        grid.innerHTML = '';
        for (let i = 0; i < visible; i++) {
            grid.appendChild(buildCard(allReviews[(rotateIndex + i) % count]));
        }
        grid.classList.remove('fading');
    }, 400);
}

function stopRotation() {
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
}

function startRotation() {
    stopRotation();
    if (allReviews.length <= VISIBLE) return;
    rotateTimer = setInterval(() => {
        rotateIndex = (rotateIndex + VISIBLE) % allReviews.length;
        renderSlide();
    }, ROTATE_MS);
}

// השהיית הקרוסלה כשהעכבר מעל ההמלצות
if (grid) {
    grid.addEventListener('mouseenter', stopRotation);
    grid.addEventListener('mouseleave', startRotation);
}

// --- טעינת המלצות ---
async function loadReviews() {
    // המלצות ברירת מחדל מתוך ה-HTML הסטטי
    const staticReviews = Array.from(grid.querySelectorAll('.testimonial')).map(parseStaticCard);
    let loaded = [];
    if (db && firestore) {
        try {
            const { collection, getDocs, query, orderBy } = firestore;
            const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            loaded = snap.docs.map(d => d.data());
        } catch (err) {
            console.warn('Failed to load reviews from Firestore', err);
        }
    } else {
        loaded = JSON.parse(localStorage.getItem('reviews') || '[]');
    }
    allReviews = [...loaded, ...staticReviews];
    rotateIndex = 0;
    renderSlide();
    startRotation();
}

// --- שמירת המלצה ---
async function saveReview(review) {
    if (db && firestore) {
        const { collection, addDoc, serverTimestamp } = firestore;
        await addDoc(collection(db, 'testimonials'), {
            ...review,
            createdAt: serverTimestamp()
        });
        return;
    }
    const local = JSON.parse(localStorage.getItem('reviews') || '[]');
    local.unshift(review);
    localStorage.setItem('reviews', JSON.stringify(local));
}

// --- ניהול המודאל ---
function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

if (openBtn) openBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (modal) {
    modal.querySelectorAll('[data-review-close]').forEach(el =>
        el.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}

// --- שליחת הטופס ---
if (formEl) {
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(formEl);
        const review = {
            name: (data.get('name') || '').toString().trim(),
            role: (data.get('role') || '').toString().trim(),
            rating: parseInt(data.get('rating'), 10) || 5,
            text: (data.get('text') || '').toString().trim()
        };

        if (!review.name || !review.text || !data.get('rating')) {
            statusEl.textContent = 'נא למלא שם, דירוג ותוכן ההמלצה.';
            statusEl.style.color = '#e05252';
            return;
        }

        submitBtn.disabled = true;
        statusEl.style.color = '';
        statusEl.textContent = 'שולח...';

        try {
            await saveReview(review);
            // הוספה לראש הרשימה והצגה מיידית
            allReviews.unshift(review);
            rotateIndex = 0;
            renderSlide();
            startRotation();
            statusEl.style.color = '#1b7a4b';
            statusEl.textContent = 'תודה רבה! ההמלצה התקבלה.';
            formEl.reset();
            setTimeout(closeModal, 1200);
        } catch (err) {
            console.error(err);
            statusEl.style.color = '#e05252';
            statusEl.textContent = 'אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// --- הפעלה ---
(async () => {
    await initFirebase();
    await loadReviews();
})();
