/* ══════════════════════════════════════════
   INCANTO – script.js
   Works with: Nepal_Gift_Database_v2.json
   Dataset Recipients : Dad | Mom | Friend
   Dataset Occasions  : Birthday | Anniversary | Festival | Casual
   Dataset Categories : Tech | Art | Sport | Food | Clothing | Lifestyle
   ══════════════════════════════════════════ */

'use strict';

/* ─── STATE ──────────────────────────────── */
const state = {
  currentStep: 1,
  totalSteps: 5,
  inputs: {
    occasion: '',
    recipient: '',
    budget: 2500,
    interests: [],
    personality: ''
  },
  giftDatabase: [],
  currentResults: [],
  allMatches: [],
  favorites: JSON.parse(localStorage.getItem('incanto_favorites') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('incanto_recent') || '[]')
};

/* ─── HELPERS ────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ─── 1. BOOT ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadGifts();
  initNavbar();
  initScrollReveal();
  initFinder();
  initBudgetSlider();
  initResultFilters();
  initModal();
  updateFavBar();
});

/* ─── 2. LOAD JSON ───────────────────────── */
function loadGifts() {
  fetch('gifts.json')
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' – file not found at: ' + res.url);
      return res.json();
    })
    .then(data => {
      const key = 'Nepal Gift Database';
      if (!data[key]) {
        console.error('❌ Key not found. Keys in file:', Object.keys(data));
        return;
      }
      state.giftDatabase = data[key];
      console.log('✅ Loaded:', state.giftDatabase.length, 'gifts');
      console.log('✅ Sample item:', state.giftDatabase[0]);
    })
    .catch(err => {
      console.error('❌ ERROR:', err.message);
      console.error('👉 Is Nepal_Gift_Database_v2.json in the SAME folder as index.html?');
      console.error('👉 Are you using Live Server? URL should start with http://localhost');
    });
}

/* ─── 3. RECIPIENT MAPPING ───────────────── 
   UI values  → Dataset "Recipient" field
   partner    → Friend  (+ romantic tag boost)
   mom        → Mom
   dad        → Dad
   friend     → Friend
   sibling    → Friend
   colleague  → Friend
   child      → Friend
   grandparent→ Mom or Dad (both)
   ─────────────────────────────────────────── */
function mapRecipient(uiValue) {
  const map = {
    'partner':     ['Friend'],
    'mom':         ['Mom'],
    'dad':         ['Dad'],
    'friend':      ['Friend'],
    'sibling':     ['Friend'],
    'colleague':   ['Friend'],
    'child':       ['Friend'],
    'grandparent': ['Mom', 'Dad']
  };
  return map[uiValue] || ['Friend'];
}

/* ─── 4. OCCASION MAPPING ────────────────── 
   UI values  → Dataset "Occasion" field
   birthday   → Birthday
   anniversary→ Anniversary
   wedding    → Anniversary  (closest match)
   festival   → Festival
   graduation → Birthday     (closest match)
   babyshower → Birthday     (closest match)
   valentine  → Anniversary  (closest match)
   justbecause→ Casual
   ─────────────────────────────────────────── */
function mapOccasion(uiValue) {
  const map = {
    'birthday':    ['Birthday'],
    'anniversary': ['Anniversary'],
    'wedding':     ['Anniversary', 'Festival'],
    'festival':    ['Festival'],
    'graduation':  ['Birthday', 'Casual'],
    'babyshower':  ['Birthday', 'Casual'],
    'valentine':   ['Anniversary', 'Birthday'],
    'justbecause': ['Casual', 'Birthday']
  };
  return map[uiValue] || ['Casual'];
}

/* ─── 5. INTEREST → CATEGORY MAPPING ────── */
const interestToCategoryMap = {
  'music':       ['Tech', 'Lifestyle'],
  'travel':      ['Sport', 'Clothing', 'Tech'],
  'fitness':     ['Sport'],
  'cooking':     ['Food', 'Lifestyle'],
  'art':         ['Art'],
  'books':       ['Lifestyle', 'Tech'],
  'gaming':      ['Tech'],
  'fashion':     ['Clothing'],
  'tech':        ['Tech'],
  'nature':      ['Sport', 'Lifestyle', 'Food'],
  'skincare':    ['Lifestyle'],
  'photography': ['Tech']
};

/* ─── 6. PERSONALITY → TAG MAPPING ──────── */
const personalityTagMap = {
  'funny':        ['funny', 'trendy', 'unique'],
  'romantic':     ['romantic', 'sentimental'],
  'practical':    ['practical', 'budget'],
  'adventurous':  ['sport', 'trendy', 'unique'],
  'artistic':     ['handmade', 'traditional', 'sentimental'],
  'intellectual': ['practical', 'premium', 'gadget']
};

/* ─── 7. EMOJI MAP BY CATEGORY ───────────── */
const categoryEmoji = {
  Tech:      '🎧',
  Art:       '🎨',
  Sport:     '⚽',
  Food:      '🍫',
  Clothing:  '👗',
  Lifestyle: '✨'
};

/* ─── 8. LOADER MESSAGES ─────────────────── */
const loaderMessages = [
  'Analyzing your preferences...',
  'Scanning 368 curated gifts...',
  'Matching personality traits...',
  'Picking the perfect ones...',
  'Almost ready...'
];

/* ─── 9. SEARCH ENGINE ───────────────────── */
function generateResults() {
  if (state.giftDatabase.length === 0) {
    alert('Gift database is still loading. Please wait a moment and try again.\n\nMake sure you opened this with Live Server (Go Live) in VS Code — not by double-clicking the file.');
    return;
  }

  // Show loading overlay with rotating messages
  const overlay = $('#loadingOverlay');
  const loaderText = $('#loaderText');
  overlay.classList.add('active');
  let msgIdx = 0;
  const msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loaderMessages.length;
    loaderText.textContent = loaderMessages[msgIdx];
  }, 400);

  setTimeout(() => {
    clearInterval(msgInterval);
    overlay.classList.remove('active');

    const budget = parseInt(state.inputs.budget);
    const mappedRecipients = mapRecipient(state.inputs.recipient);
    const mappedOccasions  = mapOccasion(state.inputs.occasion);
    const interests        = state.inputs.interests;
    const personality      = state.inputs.personality;

    // Build target categories from interests
    const targetCategories = new Set();
    interests.forEach(interest => {
      const cats = interestToCategoryMap[interest] || [];
      cats.forEach(c => targetCategories.add(c));
    });

    // Build target tags from personality
    const targetTags = new Set();
    if (personality && personalityTagMap[personality]) {
      personalityTagMap[personality].forEach(t => targetTags.add(t));
    }

    const scored = state.giftDatabase.map(gift => {
      const giftPrice     = parseInt(gift['Price (NPR)']) || 0;
      const giftCategory  = (gift['Category']  || '').trim();
      const giftRecipient = (gift['Recipient'] || '').trim();
      const giftOccasion  = (gift['Occasion']  || '').trim();
      const giftTags      = (gift['Tags']       || '').toLowerCase();

      let score = 0;

      // ── HARD FILTER: price must be within budget ──
      if (giftPrice > budget) return null;

      // ── RECIPIENT MATCH (most important) ──
      if (mappedRecipients.includes(giftRecipient)) {
        score += 200;
      } else {
        // Still show it but lower priority
        score += 20;
      }

      // ── OCCASION MATCH ──
      if (mappedOccasions.includes(giftOccasion)) {
        score += 150;
      } else if (giftOccasion === 'Casual') {
        score += 30; // casual always loosely fits
      }

      // ── INTEREST / CATEGORY MATCH ──
      if (targetCategories.size > 0 && targetCategories.has(giftCategory)) {
        score += 180;
      }

      // ── PERSONALITY / TAG MATCH ──
      targetTags.forEach(tag => {
        if (giftTags.includes(tag)) score += 60;
      });

      // ── ROMANTIC BOOST for partner ──
      if (state.inputs.recipient === 'partner' && giftTags.includes('romantic')) {
        score += 100;
      }

      // ── PRICE SWEET SPOT: prefer items close to (but under) budget ──
      const priceRatio = giftPrice / budget;
      if (priceRatio >= 0.5 && priceRatio <= 1.0) score += 40;
      if (priceRatio >= 0.7 && priceRatio <= 1.0) score += 20;

      return { ...gift, _score: score };
    }).filter(g => g !== null && g._score > 0);

    // Sort: highest score first, then by price descending (premium feel)
    scored.sort((a, b) => b._score - a._score || b['Price (NPR)'] - a['Price (NPR)']);

    state.allMatches     = scored;
    state.currentResults = scored.slice(0, 12);

    displayResults(state.currentResults);
  }, 2000);
}

/* ─── 10. RENDER GIFT CARDS ──────────────── */
function displayResults(gifts) {
  const section = $('#results');
  const grid    = $('#giftsGrid');
  grid.innerHTML = '';

  if (gifts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-muted);">
        <div style="font-size:3rem; margin-bottom:16px;">🎁</div>
        <h3 style="margin-bottom:8px; color:var(--text-primary);">No matches found</h3>
        <p>Try increasing your budget or selecting "Just Because" as the occasion.</p>
      </div>`;
  } else {
    gifts.forEach((gift, idx) => renderGiftCard(gift, idx, grid));
  }

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateFavBar();
  renderRecentlyViewed();
}

function renderGiftCard(gift, idx, container) {
  const isFaved = state.favorites.some(f => f['Item Name'] === gift['Item Name']);
  const emoji   = categoryEmoji[gift['Category']] || '🎁';
  const price   = parseInt(gift['Price (NPR)']).toLocaleString('en-IN');
  const imgUrl  = gift['Image URL'] || '';
  const darazUrl = gift['Daraz Search Link'] || `https://www.daraz.com.np/catalog/?q=${encodeURIComponent(gift['Item Name'])}`;
  const avail   = gift['Availability'] || '';

  const card = document.createElement('div');
  card.className = 'gift-card';
  card.style.animationDelay = `${idx * 0.08}s`;
  card.dataset.price = gift['Price (NPR)'];

  // Build tag pills (first 2 tags only)
  const tagPills = (gift['Tags'] || '').split(',').slice(0, 2).map(t =>
    `<span style="
      display:inline-block;
      padding:2px 8px;
      border:1px solid var(--border-strong);
      border-radius:20px;
      font-size:0.7rem;
      color:var(--text-muted);
      margin-right:4px;
      margin-top:4px;
    ">${t.trim()}</span>`
  ).join('');

  // Availability badge color
  const availColor = avail === 'Both' ? '#22c55e' : avail === 'Daraz' ? '#3b82f6' : '#f59e0b';

  card.innerHTML = `
    <div class="gift-img-wrap" style="position:relative; overflow:hidden;">
      <span style="position:relative;z-index:1;font-size:3.5rem;">${emoji}</span>
      <div class="gift-badge">${gift['Category']}</div>
      <button class="fav-btn ${isFaved ? 'saved' : ''}" aria-label="Save gift">
        ${isFaved ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="gift-body">
      <h3 class="gift-name">${gift['Item Name']}</h3>
      <p class="gift-desc">${gift['Description']}</p>
      <div class="gift-ai-reason">
        <strong>✦ Why we picked this</strong>
        For ${gift['Recipient']} · ${gift['Occasion']} ·
        <span style="color:${availColor}; font-style:normal;">${avail}</span>
      </div>
      <div style="margin-bottom:12px;">${tagPills}</div>
      <div class="gift-footer">
        <div class="gift-price">
          Rs. ${price}<span> NPR</span>
        </div>
        <a href="${darazUrl}" target="_blank" rel="noopener noreferrer" class="btn-buy">
          Buy Now →
        </a>
      </div>
    </div>
  `;

  // Favorite toggle
  card.querySelector('.fav-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    toggleFavorite(gift, this);
  });

  // Track recently viewed on card click
  card.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-buy') || e.target.classList.contains('fav-btn')) return;
    addToRecent(gift);
  });

  container.appendChild(card);
}

/* ─── 11. RESULT PRICE FILTERS ───────────── */
function initResultFilters() {
  $$('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('.btn-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;
      let filtered;

      if (filter === 'all') {
        filtered = state.allMatches.slice(0, 12);
      } else if (filter === 'under2k') {
        filtered = state.allMatches.filter(g => parseInt(g['Price (NPR)']) < 2000);
      } else if (filter === '2kto5k') {
        filtered = state.allMatches.filter(g => {
          const p = parseInt(g['Price (NPR)']);
          return p >= 2000 && p <= 5000;
        });
      } else if (filter === 'above5k') {
        filtered = state.allMatches.filter(g => parseInt(g['Price (NPR)']) > 5000);
      }

      const grid = $('#giftsGrid');
      grid.innerHTML = '';
      if (!filtered || filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">
            No gifts in this price range within your results.
          </div>`;
      } else {
        filtered.slice(0, 12).forEach((g, i) => renderGiftCard(g, i, grid));
      }
    });
  });
}

/* ─── 12. LOAD MORE ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const loadMoreBtn = $('#loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const grid = $('#giftsGrid');
      const currentCount = grid.querySelectorAll('.gift-card').length;
      const nextBatch = state.allMatches.slice(currentCount, currentCount + 6);
      if (nextBatch.length === 0) {
        loadMoreBtn.textContent = 'No more results';
        loadMoreBtn.disabled = true;
        return;
      }
      nextBatch.forEach((g, i) => renderGiftCard(g, currentCount + i, grid));
    });
  }

  const restartBtn = $('#restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      $('#results').style.display = 'none';
      goToStep(1);
      // Reset state inputs
      state.inputs = { occasion: '', recipient: '', budget: 2500, interests: [], personality: '' };
      $$('.choice-btn, .tag-btn, .pers-btn').forEach(b => b.classList.remove('selected'));
      $('#next1').disabled = true;
      $('#next2').disabled = true;
      const slider = $('#budgetSlider');
      if (slider) slider.value = 2500;
      const budgetVal = $('#budgetVal');
      if (budgetVal) budgetVal.textContent = '2,500';
      document.querySelector('#finder').scrollIntoView({ behavior: 'smooth' });
    });
  }
});

/* ─── 13. FAVORITES ──────────────────────── */
function toggleFavorite(gift, btn) {
  const key = gift['Item Name'];
  const idx = state.favorites.findIndex(f => f['Item Name'] === key);

  if (idx > -1) {
    state.favorites.splice(idx, 1);
    btn.innerHTML = '🤍';
    btn.classList.remove('saved');
    showToast(`Removed from saved gifts`);
  } else {
    state.favorites.push(gift);
    btn.innerHTML = '❤️';
    btn.classList.add('saved');
    showToast(`❤️ Saved: ${key}`);
  }

  localStorage.setItem('incanto_favorites', JSON.stringify(state.favorites));
  updateFavBar();
}

function updateFavBar() {
  const bar = $('#favoritesBar');
  const countEl = $('#favCount');
  if (!bar || !countEl) return;
  const count = state.favorites.length;
  bar.style.display = count > 0 ? 'flex' : 'none';
  countEl.textContent = count;
}

/* ─── 14. FAVORITES MODAL ────────────────── */
function initModal() {
  const viewFavsBtn = $('#viewFavsBtn');
  const modal       = $('#favsModal');
  const modalClose  = $('#modalClose');
  const modalBody   = $('#modalBody');

  if (!viewFavsBtn || !modal) return;

  viewFavsBtn.addEventListener('click', () => {
    modalBody.innerHTML = '';
    if (state.favorites.length === 0) {
      modalBody.innerHTML = '<p class="modal-empty">No saved gifts yet. Hit 🤍 on any gift card to save it here.</p>';
    } else {
      state.favorites.forEach(gift => {
        const el = document.createElement('div');
        el.className = 'modal-gift-item';
        const emoji = categoryEmoji[gift['Category']] || '🎁';
        const price = parseInt(gift['Price (NPR)']).toLocaleString('en-IN');
        const darazUrl = gift['Daraz Search Link'] || '#';
        el.innerHTML = `
          <div class="modal-gift-emoji">${emoji}</div>
          <div class="modal-gift-info">
            <strong>${gift['Item Name']}</strong>
            <span>Rs. ${price} · ${gift['Category']} · ${gift['Availability'] || ''}</span>
          </div>
          <a href="${darazUrl}" target="_blank" rel="noopener noreferrer"
            style="padding:8px 14px; background:linear-gradient(135deg,#c4637a,#7a3f6e);
            color:#fff; border-radius:20px; font-size:0.78rem; font-weight:600; white-space:nowrap;">
            Buy →
          </a>
        `;
        modalBody.appendChild(el);
      });
    }
    modal.classList.add('open');
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ─── 16. FINDER STEP NAVIGATION ─────────── */
function initFinder() {
  // Single-select buttons (Occasion + Recipient)
  $$('.choice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const stepEl = this.closest('.finder-step');
      stepEl.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');

      const stepId = stepEl.id;
      if (stepId === 'step-1') {
        state.inputs.occasion = this.dataset.value;
        $('#next1').disabled = false;
      } else if (stepId === 'step-2') {
        state.inputs.recipient = this.dataset.value;
        $('#next2').disabled = false;
      }
    });
  });

  // Multi-select tags (Interests)
  $$('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('selected');
      const val = this.dataset.value;
      if (this.classList.contains('selected')) {
        if (!state.inputs.interests.includes(val)) state.inputs.interests.push(val);
      } else {
        state.inputs.interests = state.inputs.interests.filter(i => i !== val);
      }
    });
  });

  // Personality (single select)
  $$('.pers-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      $$('.pers-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      state.inputs.personality = this.dataset.value;
    });
  });

  // Next buttons
  $$('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      const currentNum = parseInt(this.id.replace('next', ''));
      goToStep(currentNum + 1);
    });
  });

  // Back buttons
  $$('.btn-back').forEach(btn => {
    btn.addEventListener('click', function() {
      const currentNum = parseInt(this.closest('.finder-step').id.split('-')[1]);
      goToStep(currentNum - 1);
    });
  });

  // Find Gifts button
  const findBtn = $('#findGifts');
  if (findBtn) {
    findBtn.addEventListener('click', generateResults);
  }
}

function goToStep(step) {
  if (step < 1 || step > 5) return;
  state.currentStep = step;

  $$('.finder-step').forEach(s => s.classList.remove('active'));
  const target = $(`#step-${step}`);
  if (target) target.classList.add('active');

  $$('.pstep').forEach(dot => {
    const dotNum = parseInt(dot.dataset.step);
    dot.classList.toggle('active', dotNum === step);
    dot.classList.toggle('completed', dotNum < step);
  });

  const fillEl = $('#progressFill');
  if (fillEl) fillEl.style.width = ((step - 1) / (state.totalSteps - 1) * 100) + '%';
}

/* ─── 17. BUDGET SLIDER ──────────────────── */
function initBudgetSlider() {
  const slider    = $('#budgetSlider');
  const valEl     = $('#budgetVal');
  if (!slider || !valEl) return;

  slider.addEventListener('input', function() {
    const v = parseInt(this.value);
    state.inputs.budget = v;
    valEl.textContent = v.toLocaleString('en-IN');
  });

  $$('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const v = parseInt(this.dataset.val);
      slider.value = v;
      state.inputs.budget = v;
      valEl.textContent = v.toLocaleString('en-IN');
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* ─── 18. TOAST ──────────────────────────── */
function showToast(msg, duration = 2800) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── 19. NAVBAR ─────────────────────────── */
function initNavbar() {
  window.addEventListener('scroll', () => {
    const navbar = $('#navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    // Close on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }
}

/* ─── 20. SCROLL REVEAL ──────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}