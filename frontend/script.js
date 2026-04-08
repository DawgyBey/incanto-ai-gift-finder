/* ══════════════════════════════════════════
   INCANTO – AI Gift Finder
   script.js — Full Application Logic
   ══════════════════════════════════════════ */

'use strict';

/* ─── GIFT DATABASE MOVED TO BACKEND ───────── */

/* ─── ROULETTE DATA ──────────────────────── */
const ROULETTE_RESULTS = [
  { emoji: '🎧', name: 'Headphones', suggestion: 'Wireless noise-cancelling headphones! Perfect for music lovers.' },
  { emoji: '📚', name: 'Books', suggestion: 'A curated set of books based on their favourite genre!' },
  { emoji: '🍫', name: 'Chocolates', suggestion: 'An artisan chocolate tasting box — pure joy in every bite.' },
  { emoji: '🧴', name: 'Skincare', suggestion: 'A premium skincare ritual kit for some well-deserved self-care.' },
  { emoji: '🌸', name: 'Flowers', suggestion: 'A luxurious bouquet of preserved roses — beauty that lasts.' },
  { emoji: '🎮', name: 'Gaming', suggestion: 'A gaming gift card or controller upgrade for the gamer in them.' },
  { emoji: '✈️', name: 'Experience', suggestion: 'An experience gift — think cooking class, spa day, or city tour.' },
  { emoji: '💌', name: 'Personal Note', suggestion: 'A handwritten letter with a meaningful keepsake gift box.' }
];

/* ─── APP STATE ──────────────────────────── */
const state = {
  currentStep: 1,
  totalSteps: 5,
  inputs: {
    occasion: null,
    recipient: null,
    budget: 2500,
    interests: [],
    personality: null
  },
  favorites: JSON.parse(localStorage.getItem('incanto_favorites') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('incanto_recent') || '[]'),
  currentResults: [],
  rouletteSpinning: false,
  rouletteRotation: 0
};

/* ─── DOM REFS ───────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ─── INIT ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initScrollReveal();
  initFinder();
  initBudgetSlider();
  initRoulette();
  initFilters();
  updateFavoritesUI();
});

/* ─── THEME ──────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('incanto_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);

  $('#darkToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('incanto_theme', next);
    updateToggleIcon(next);
  });
}

function updateToggleIcon(theme) {
  const icon = $('#darkToggle .toggle-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ─── NAVBAR ─────────────────────────────── */
function initNavbar() {
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Hamburger
  const ham = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  ham.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close mobile menu on link click
  $$('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // Surprise Me button
  $('#surpriseBtn').addEventListener('click', () => {
    triggerSurprise();
  });
}

/* ─── SCROLL REVEAL ──────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ─── FINDER LOGIC ───────────────────────── */
function initFinder() {
  // Choice buttons (single select)
  $$('#step-1 .choice-btn, #step-2 .choice-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const step = this.closest('.finder-step').id;
      $$(`#${step} .choice-btn`).forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');

      if (step === 'step-1') {
        state.inputs.occasion = this.dataset.value;
        $('#next1').disabled = false;
      } else if (step === 'step-2') {
        state.inputs.recipient = this.dataset.value;
        $('#next2').disabled = false;
      }
    });
  });

  // Tag buttons (multi-select)
  $$('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('selected');
      const val = this.dataset.value;
      if (this.classList.contains('selected')) {
        state.inputs.interests.push(val);
      } else {
        state.inputs.interests = state.inputs.interests.filter(i => i !== val);
      }
    });
  });

  // Personality buttons (single select)
  $$('.pers-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.pers-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      state.inputs.personality = this.dataset.value;
    });
  });

  // Navigation buttons
  $$('.btn-next').forEach(btn => {
    btn.addEventListener('click', function () {
      const currentId = parseInt(this.id.replace('next', ''));
      goToStep(currentId + 1);
    });
  });

  $$('.btn-back').forEach(btn => {
    btn.addEventListener('click', function () {
      const step = parseInt(this.closest('.finder-step').id.split('-')[1]);
      goToStep(step - 1);
    });
  });

  // Find Gifts button
  $('#findGifts').addEventListener('click', () => {
    generateResults();
  });

  // Restart
  $('#restartBtn').addEventListener('click', restartFinder);
  $('#loadMoreBtn').addEventListener('click', loadMoreGifts);

  // Favorites modal
  $('#viewFavsBtn').addEventListener('click', () => {
    openFavoritesModal();
  });

  $('#modalClose').addEventListener('click', () => {
    $('#favsModal').classList.remove('open');
  });

  $('#favsModal').addEventListener('click', (e) => {
    if (e.target === $('#favsModal')) {
      $('#favsModal').classList.remove('open');
    }
  });
}

function goToStep(step) {
  const current = state.currentStep;

  // Validate step
  if (step < 1 || step > state.totalSteps) return;

  // Mark previous step as completed
  $(`.pstep[data-step="${current}"]`).classList.remove('active');
  $(`.pstep[data-step="${current}"]`).classList.add('completed');

  // Update current step
  state.currentStep = step;

  // Show/hide steps
  $$('.finder-step').forEach(s => s.classList.remove('active'));
  $(`#step-${step}`).classList.add('active');

  // Update progress steps
  $$('.pstep').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (sNum < step) s.classList.add('completed');
    if (sNum === step) s.classList.add('active');
  });

  // Update progress bar
  const pct = ((step - 1) / (state.totalSteps - 1)) * 100;
  $('#progressFill').style.width = `${pct}%`;

  // Scroll to finder
  $('#finder').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─── BUDGET SLIDER ──────────────────────── */
function initBudgetSlider() {
  const slider = $('#budgetSlider');
  const val = $('#budgetVal');

  slider.addEventListener('input', function () {
    state.inputs.budget = parseInt(this.value);
    val.textContent = parseInt(this.value).toLocaleString('en-IN');
    updateSliderBackground(this);
  });

  // Preset buttons
  $$('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const v = parseInt(this.dataset.val);
      slider.value = v;
      state.inputs.budget = v;
      val.textContent = v.toLocaleString('en-IN');
      updateSliderBackground(slider);
    });
  });
}

function updateSliderBackground(slider) {
  const min = slider.min;
  const max = slider.max;
  const value = slider.value;
  const pct = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(90deg, var(--rose) 0%, var(--gold) ${pct}%, var(--border) ${pct}%)`;
}

/* ─── GENERATE RESULTS ───────────────────── */
async function generateResults() {
  // Show loading overlay
  const overlay = $('#loadingOverlay');
  overlay.classList.add('active');

  // Cycle loading messages
  const messages = [
    'Analyzing your preferences...',
    'Scanning curated gifts...',
    'Matching personality & interests...',
    'Almost ready — finding the perfect picks ✨'
  ];
  let msgIndex = 0;
  const loaderText = $('#loaderText');

  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % messages.length;
    loaderText.textContent = messages[msgIndex];
  }, 900);

  try {
    const res = await fetch('/api/generate-gifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.inputs)
    });
    const data = await res.json();
    
    clearInterval(msgInterval);
    overlay.classList.remove('active');

    if (data.success) {
      state.currentResults = data.gifts;
      displayResults(data.gifts);
    } else {
      showToast('Oops! Failed to fetch recommendations.');
    }
  } catch (err) {
    clearInterval(msgInterval);
    overlay.classList.remove('active');
    showToast('Network error while analyzing gifts.');
    console.error(err);
  }
}

function displayResults(gifts) {
  const section = $('#results');
  const grid = $('#giftsGrid');
  const title = $('#resultsTitle');

  // Update title
  const recipientNames = {
    partner: 'your partner', friend: 'your friend', mom: 'mom',
    dad: 'dad', sibling: 'your sibling', colleague: 'your colleague',
    child: 'the little one', grandparent: 'grandma or grandpa'
  };

  const recipient = state.inputs.recipient;
  if (recipient && recipientNames[recipient]) {
    title.textContent = `Perfect gifts for ${recipientNames[recipient]} ✨`;
  }

  // Render cards
  grid.innerHTML = '';
  gifts.forEach((gift, idx) => {
    const card = createGiftCard(gift, idx);
    grid.appendChild(card);
  });

  // Show results
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animate cards
  $$('.gift-card').forEach((card, idx) => {
    card.style.animationDelay = `${idx * 0.1}s`;
  });

  // Show recently viewed
  renderRecentlyViewed();
}

function createGiftCard(gift, idx) {
  const isFaved = state.favorites.some(f => f.id === gift.id);
  const div = document.createElement('div');
  div.className = 'gift-card';
  div.dataset.id = gift.id;
  div.dataset.price = gift.price;

  div.innerHTML = `
    <div class="gift-img-wrap">
      <span style="position:relative;z-index:1">${gift.emoji || '🎁'}</span>
      ${gift.badge ? `<div class="gift-badge">${gift.badge}</div>` : ''}
      <button class="fav-btn ${isFaved ? 'saved' : ''}" data-id="${gift.id}" title="Save to favorites">
        ${isFaved ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="gift-body">
      <h3 class="gift-name">${gift.name}</h3>
      <p class="gift-desc">${gift.description}</p>
      <div class="gift-ai-reason">
        <strong>✦ Why it's perfect</strong>
        ${gift.reason || gift.aiReason}
      </div>
      <div class="gift-footer">
        <div class="gift-price">
          ${gift.price || gift.priceLabel}
          <span>onwards</span>
        </div>
        <a href="${gift.link || (gift.affiliate ? gift.affiliate.daraz : '#')}" target="_blank" rel="noopener noreferrer" class="btn-buy" data-gift-id="${gift.id}">
          Buy Now →
        </a>
      </div>
    </div>
  `;

  // Favorite toggle
  div.querySelector('.fav-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    toggleFavorite(gift, this);
  });

  // Track viewed on buy click
  div.querySelector('.btn-buy').addEventListener('click', () => {
    addToRecentlyViewed(gift);
  });

  // Track viewed on card hover
  div.addEventListener('mouseenter', () => {
    addToRecentlyViewed(gift);
  });

  return div;
}

/* ─── FAVORITES ──────────────────────────── */
function toggleFavorite(gift, btn) {
  const exists = state.favorites.findIndex(f => f.id === gift.id);

  if (exists > -1) {
    state.favorites.splice(exists, 1);
    btn.classList.remove('saved');
    btn.textContent = '🤍';
    showToast(`Removed "${gift.name}" from saved`);
  } else {
    state.favorites.push({ id: gift.id, name: gift.name, emoji: gift.emoji || '🎁', priceLabel: gift.price || gift.priceLabel });
    btn.classList.add('saved');
    btn.textContent = '❤️';
    showToast(`Saved "${gift.name}" ❤️`);
  }

  localStorage.setItem('incanto_favorites', JSON.stringify(state.favorites));
  updateFavoritesUI();
}

function updateFavoritesUI() {
  const bar = $('#favoritesBar');
  const count = $('#favCount');

  if (state.favorites.length > 0) {
    bar.style.display = 'flex';
    count.textContent = state.favorites.length;
  } else {
    bar.style.display = 'none';
  }
}

function openFavoritesModal() {
  const modal = $('#favsModal');
  const body = $('#modalBody');

  body.innerHTML = '';

  if (state.favorites.length === 0) {
    body.innerHTML = '<div class="modal-empty">No saved gifts yet. Start exploring! 🎁</div>';
  } else {
    state.favorites.forEach(fav => {
      const item = document.createElement('div');
      item.className = 'modal-gift-item';
      item.innerHTML = `
        <div class="modal-gift-emoji">${fav.emoji}</div>
        <div class="modal-gift-info">
          <strong>${fav.name}</strong>
          <span>${fav.priceLabel}</span>
        </div>
        <button class="btn-buy" onclick="window.open('https://www.daraz.com.np/?q=${encodeURIComponent(fav.name)}', '_blank')" style="font-size:0.78rem;padding:8px 14px;">
          Buy →
        </button>
      `;
      body.appendChild(item);
    });
  }

  modal.classList.add('open');
}

/* ─── RECENTLY VIEWED ────────────────────── */
function addToRecentlyViewed(gift) {
  // Avoid duplicates
  state.recentlyViewed = state.recentlyViewed.filter(g => g.id !== gift.id);
  state.recentlyViewed.unshift({ id: gift.id, name: gift.name, emoji: gift.emoji || '🎁', priceLabel: gift.price || gift.priceLabel });
  // Keep max 6
  state.recentlyViewed = state.recentlyViewed.slice(0, 6);
  localStorage.setItem('incanto_recent', JSON.stringify(state.recentlyViewed));
}

function renderRecentlyViewed() {
  if (state.recentlyViewed.length === 0) return;

  const section = $('#recentSection');
  const grid = $('#recentGrid');

  grid.innerHTML = '';
  state.recentlyViewed.forEach(gift => {
    const card = document.createElement('div');
    card.className = 'recent-card';
    card.innerHTML = `
      <div class="recent-emoji">${gift.emoji}</div>
      <div class="recent-name">${gift.name.slice(0, 28)}${gift.name.length > 28 ? '…' : ''}</div>
      <div class="recent-price">${gift.priceLabel}</div>
    `;
    grid.appendChild(card);
  });

  section.style.display = 'block';
}

/* ─── FILTERS ────────────────────────────── */
function initFilters() {
  $$('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.btn-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterCards(this.dataset.filter);
    });
  });
}

function filterCards(filter) {
  $$('.gift-card').forEach(card => {
    const price = parseInt(card.dataset.price);
    let show = true;

    if (filter === 'under2k') show = price < 2000;
    else if (filter === '2kto5k') show = price >= 2000 && price <= 5000;
    else if (filter === 'above5k') show = price > 5000;

    card.style.display = show ? 'block' : 'none';
  });
}

/* ─── LOAD MORE GIFTS ────────────────────── */
async function loadMoreGifts() {
  const btn = $('#loadMoreBtn');
  btn.textContent = 'Loading more...';
  btn.disabled = true;

  try {
    const currentIds = state.currentResults.map(g => g.id);
    const res = await fetch('/api/more', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excludeIds: currentIds })
    });
    const data = await res.json();

    if (data.success && data.gifts.length > 0) {
      const grid = $('#giftsGrid');
      data.gifts.forEach((gift, idx) => {
        const card = createGiftCard(gift, idx);
        card.style.animationDelay = `${idx * 0.1}s`;
        grid.appendChild(card);
        state.currentResults.push(gift);
      });

      btn.textContent = 'Show More Like These';
      btn.disabled = false;
      showToast('Loaded more gift ideas! 🎁');
    } else {
      btn.textContent = 'All gifts shown ✨';
      btn.disabled = true;
    }
  } catch(err) {
    btn.textContent = 'Show More Like These';
    btn.disabled = false;
    showToast('Failed to load more items.');
  }
}

/* ─── RESTART FINDER ─────────────────────── */
function restartFinder() {
  // Reset state
  state.inputs = { occasion: null, recipient: null, budget: 2500, interests: [], personality: null };
  state.currentStep = 1;
  state.currentResults = [];

  // Reset UI
  $$('.choice-btn, .tag-btn, .pers-btn').forEach(b => b.classList.remove('selected'));
  $$('.btn-next').forEach(b => b.disabled = true);
  $('#next3').disabled = false; // Budget step always valid
  $('#budgetSlider').value = 2500;
  $('#budgetVal').textContent = '2,500';
  $$('.preset-btn').forEach(b => b.classList.remove('active'));

  // Go to step 1
  $$('.finder-step').forEach(s => s.classList.remove('active'));
  $('#step-1').classList.add('active');

  $$('.pstep').forEach(s => s.classList.remove('active', 'completed'));
  $('.pstep[data-step="1"]').classList.add('active');
  $('#progressFill').style.width = '0%';

  // Hide results
  $('#results').style.display = 'none';

  // Scroll to finder
  $('#finder').scrollIntoView({ behavior: 'smooth' });
}

/* ─── SURPRISE ME ────────────────────────── */
async function triggerSurprise() {
  // Show loading briefly
  const overlay = $('#loadingOverlay');
  overlay.classList.add('active');
  $('#loaderText').textContent = 'Preparing a surprise just for you... 🎲';

  try {
    const res = await fetch('/api/surprise?count=6');
    const data = await res.json();

    overlay.classList.remove('active');

    if (data.success) {
      state.currentResults = data.gifts;
      $('#resultsTitle').textContent = 'Surprise picks, just for you 🎲';

      const grid = $('#giftsGrid');
      grid.innerHTML = '';
      data.gifts.forEach((gift, idx) => {
        const card = createGiftCard(gift, idx);
        card.style.animationDelay = `${idx * 0.1}s`;
        grid.appendChild(card);
      });

      $('#results').style.display = 'block';
      $('#results').scrollIntoView({ behavior: 'smooth' });
      showToast('🎲 Surprise gifts loaded!');
    }
  } catch (err) {
    overlay.classList.remove('active');
    showToast('Failed to pick surprise gifts.');
  }
}

/* ─── GIFT ROULETTE ──────────────────────── */
function initRoulette() {
  $('#spinBtn').addEventListener('click', spinWheel);
}

function spinWheel() {
  if (state.rouletteSpinning) return;

  state.rouletteSpinning = true;
  const btn = $('#spinBtn');
  btn.classList.add('spinning');
  btn.textContent = '🎲 Spinning...';

  const wheel = $('#rouletteWheel');
  const result = $('#rouletteResult');
  result.style.opacity = '0';

  // Random number of full spins + offset
  const spins = 5 + Math.floor(Math.random() * 4);
  const targetSegment = Math.floor(Math.random() * ROULETTE_RESULTS.length);
  const segmentAngle = 360 / ROULETTE_RESULTS.length;
  const targetAngle = spins * 360 + (targetSegment * segmentAngle);

  state.rouletteRotation += targetAngle;
  wheel.style.transform = `rotate(${state.rouletteRotation}deg)`;

  setTimeout(() => {
    state.rouletteSpinning = false;
    btn.classList.remove('spinning');
    btn.textContent = '🎲 Spin Again';

    const pick = ROULETTE_RESULTS[targetSegment];
    result.innerHTML = `<strong>${pick.emoji} ${pick.name}</strong><br><small>${pick.suggestion}</small>`;
    result.style.opacity = '1';

    showToast(`🎲 You got: ${pick.name}!`);
  }, 3200);
}

/* ─── TOAST NOTIFICATION ─────────────────── */
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ─── SPA ROUTING ────────────────────────── */
function handleRouting() {
  const hash = window.location.hash || '#home';
  const targetId = hash.replace('#', '');
  
  const isHomeView = ['home', 'hero', 'how', 'finder', 'results', 'roulette', 'about'].includes(targetId);
  const mainViewId = isHomeView ? 'home' : targetId;
  
  const sections = document.querySelectorAll('.view-section');
  let found = false;
  
  sections.forEach(sec => {
    if (sec.id === mainViewId) {
      sec.classList.add('active');
      found = true;
    } else {
      sec.classList.remove('active');
    }
  });

  if (!found) {
    const homeMsg = document.getElementById('home');
    if (homeMsg) homeMsg.classList.add('active');
  }

  // Handle smooth scroll if it's a home sub-section
  if (isHomeView && targetId !== 'home') {
    // slight delay to allow section display to toggle before scrolling
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if(el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 10);
  } else {
    window.scrollTo({top: 0});
  }

  // Close mobile menu if open
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

window.addEventListener('hashchange', handleRouting);
document.addEventListener('DOMContentLoaded', handleRouting);

/* ─── KEYBOARD ACCESSIBILITY ─────────────── */
document.addEventListener('keydown', (e) => {
  // Close modal on Escape
  if (e.key === 'Escape') {
    $('#favsModal').classList.remove('open');
  }
});
