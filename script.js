'use strict';

/* ─── CONFIG ─────────────────────────────── */
const API_BASE = 'http://localhost:5000/api/v1';

/* ─── MOCK FALLBACK DATA ─────────────────── */
const GIFT_DATABASE = [
  { id: 1, name: "Aura Noise Cancelling Headphones", description: "Premium wireless headphones with spatial audio.", emoji: "🎧", price: 8500, priceLabel: "Rs. 8,500", badge: "#1 Trending", reason: "Perfect for music lovers and remote workers.", tags: ["music", "technology"], recipients: ["partner","friend","sibling"], link: "#" },
  { id: 2, name: "Artisan Coffee Brewing Kit", description: "Complete pour-over setup with freshly roasted beans.", emoji: "☕", price: 3200, priceLabel: "Rs. 3,200", badge: "Hot Pick", reason: "Ideal for coffee enthusiasts.", tags: ["coffee","food","cooking"], recipients: ["colleague","friend","parent"], link: "#" },
  { id: 3, name: "Smart Desktop Planter", description: "Self-watering indoor planter with LED grow lights.", emoji: "🪴", price: 4500, priceLabel: "Rs. 4,500", badge: "Fast Seller", reason: "Great for plant lovers.", tags: ["gardening","home","nature"], recipients: ["friend","partner","parent"], link: "#" },
  { id: 4, name: "Chunky Knit Weighted Blanket", description: "Cozy, temperature-regulating weighted blanket.", emoji: "🧶", price: 6800, priceLabel: "Rs. 6,800", badge: "Highly Rated", reason: "Provides comfort and reduces anxiety.", tags: ["wellness","self-care","home"], recipients: ["partner","parent","sibling"], link: "#" },
  { id: 5, name: "Vintage Instant Film Camera", description: "Retro-style instant camera with modern autofocus.", emoji: "📷", price: 12000, priceLabel: "Rs. 12,000", badge: "Nostalgia Pick", reason: "Creates tangible memories.", tags: ["photography","art","travel"], recipients: ["friend","sibling","partner"], link: "#" },
  { id: 6, name: "Gourmet Himalayan Truffles", description: "Handcrafted chocolates with local nuts and berries.", emoji: "🍫", price: 1500, priceLabel: "Rs. 1,500", badge: "Local Favorite", reason: "Sweet treat that feels luxurious.", tags: ["food","chocolate","gourmet"], recipients: ["colleague","friend","parent","partner"], link: "#" },
  { id: 7, name: "Aromatherapy Diffuser Set", description: "Ultrasonic diffuser with 6 premium essential oils.", emoji: "🌸", price: 2800, priceLabel: "Rs. 2,800", badge: "Wellness Pick", reason: "Creates a calming atmosphere.", tags: ["wellness","relaxation","self-care"], recipients: ["partner","parent","friend"], link: "#" },
  { id: 8, name: "Wireless Charging Pad", description: "Fast-charging 3-in-1 wireless charger.", emoji: "⚡", price: 3500, priceLabel: "Rs. 3,500", badge: "Tech Essential", reason: "Practical gift for the organised tech user.", tags: ["technology","gadgets"], recipients: ["colleague","friend","sibling"], link: "#" },
  { id: 9, name: "Personalized Star Map", description: "Custom print of the night sky from a special date.", emoji: "⭐", price: 4200, priceLabel: "Rs. 4,200", badge: "Sentimental", reason: "Captures a meaningful moment forever.", tags: ["memories","personalized","art"], recipients: ["partner","parent","friend"], link: "#" },
  { id: 10, name: "Leather Journal Set", description: "Hand-bound leather journal with fountain pen.", emoji: "📓", price: 1900, priceLabel: "Rs. 1,900", badge: "Creative", reason: "For the writer or dreamer in your life.", tags: ["writing","creativity","stationery"], recipients: ["friend","colleague","sibling"], link: "#" }
];

/* ─── APP STATE ──────────────────────────── */
const state = {
  currentStep: 1,
  totalSteps: 5,
  inputs: { occasion: null, recipient: null, budget: 2500, interests: [], personality: null },
  favorites: JSON.parse(localStorage.getItem('incanto_favorites') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('incanto_recent') || '[]'),
  currentResults: [],
  pendingPurchaseGift: null
};

const recipientOptionsByOccasion = {
  birthday: ["partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"],
  anniversary: ["partner"],
  wedding: ["partner", "mom", "dad", "sibling", "grandparent"],
  festival: ["partner", "friend", "mom", "dad", "sibling", "colleague", "grandparent"],
  graduation: ["friend", "sibling", "child", "colleague"],
  babyshower: ["partner", "mom", "dad"],
  valentine: ["partner"],
  justbecause: ["partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"]
};

const allRecipientOptions = [
  "partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"
];

function updateRecipientOptions(occasion) {
  const allowed = recipientOptionsByOccasion[occasion] || allRecipientOptions;
  $$('#step-2 .choice-btn').forEach((btn) => {
    const value = btn.dataset.value;
    if (allowed.includes(value)) {
      btn.style.display = "inline-flex";
      btn.classList.remove("disabled");
    } else {
      btn.style.display = "none";
      btn.classList.remove("selected");
    }
  });

  if (state.inputs.recipient && !allowed.includes(state.inputs.recipient)) {
    state.inputs.recipient = null;
    $('#next2').disabled = true;
  }
}

/* ─── HELPERS ────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/* ─── GENERATE RESULTS ───────────────────── */
async function generateResults() {
  const overlay = $('#loadingOverlay');
  overlay.classList.add('active');

  const messages = [
    'Analysing your preferences...',
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

  const done = () => {
    clearInterval(msgInterval);
    overlay.classList.remove('active');
  };

  // Map local recipient names to backend-accepted values
  const recipientMap = {
    partner: 'partner', friend: 'friend', mom: 'parent', dad: 'parent',
    sibling: 'sibling', colleague: 'colleague', child: 'child', grandparent: 'other'
  };

  const recipient = recipientMap[state.inputs.recipient] || null;

  try {
    // Save preferences first (best-effort — don't block on failure)
    if (state.isAuthenticated) {
      await apiFetch('/users/preferences', {
        method: 'POST',
        body: JSON.stringify({
          recipient,
          budget: state.inputs.budget,
          interests: state.inputs.interests,
          personality: state.inputs.personality,
          occasion: state.inputs.occasion
        })
      }).catch(() => {});
    }

    // Fetch recommendations
    const params = new URLSearchParams();
    if (recipient) params.set('recipient', recipient);
    if (state.inputs.budget) params.set('budget', state.inputs.budget);
    if (state.inputs.interests.length) params.set('interests', state.inputs.interests.join(','));
    if (state.inputs.personality) params.set('personality', state.inputs.personality);
    if (state.inputs.occasion) params.set('occasion', state.inputs.occasion);
    params.set('limit', '9');

    const { ok, data } = await apiFetch(`/gifts/recommendations?${params}`);

    done();

    if (ok && data.success && data.data.results.length > 0) {
      // Normalise backend gift shape to match frontend card format
      const gifts = data.data.results.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        imageUrl: g.imageUrl || g.image_url || null,
        emoji: '🎁',
        price: g.price,
        priceLabel: g.price ? `Rs. ${g.price.toLocaleString()}` : 'Price unavailable',
        badge: g.trending ? 'Trending' : (g.rating >= 4.8 ? 'Top Rated' : null),
        reason: g.reason || `Rated ${g.rating ?? '4.0'}/5 · ${g.category || ''}`,
        link: g.link || g.affiliateUrl || '#'
      }));
      state.currentResults = gifts;
      displayResults(gifts);
      showToast(`Found ${gifts.length} perfect gift ideas! 🎁`);
    } else {
      throw new Error('No results from API');
    }

  } catch (err) {
    done();
    console.warn('API recommendations failed, using local fallback:', err.message);

    // Local fallback: filter by budget + interests
    const filtered = GIFT_DATABASE.filter(g => {
      const withinBudget = g.price <= state.inputs.budget + 2000;
      const recipientMatch = !state.inputs.recipient || g.recipients.includes(state.inputs.recipient) || g.recipients.includes(recipient);
      const interestMatch = state.inputs.interests.length === 0 ||
        state.inputs.interests.some(i => g.tags.includes(i));
      return withinBudget && (recipientMatch || interestMatch);
    });

    const results = (filtered.length > 0 ? filtered : GIFT_DATABASE).slice(0, 6);
    state.currentResults = results;
    displayResults(results);
    showToast('Showing curated recommendations ✨');
  }
}

/* ─── DISPLAY ────────────────────────────── */
function displayResults(gifts) {
  const section = $('#results');
  const grid = $('#giftsGrid');
  const title = $('#resultsTitle');

  const recipientNames = {
    partner: 'your partner', friend: 'your friend', mom: 'mom',
    dad: 'dad', sibling: 'your sibling', colleague: 'your colleague',
    child: 'the little one', grandparent: 'grandma or grandpa'
  };

  if (state.inputs.recipient && recipientNames[state.inputs.recipient]) {
    title.textContent = `Perfect gifts for ${recipientNames[state.inputs.recipient]} ✨`;
  }

  grid.innerHTML = '';
  gifts.forEach((gift, idx) => {
    const card = createGiftCard(gift, idx);
    grid.appendChild(card);
  });

  section.style.display = 'block';
  const navbarHeight = 68;
  const elementPosition = section.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
  $$('.gift-card').forEach((card, idx) => { card.style.animationDelay = `${idx * 0.1}s`; });
  renderRecentlyViewed();
}

function createGiftCard(gift) {
  const isFaved = state.favorites.some(f => f.id === gift.id);
  const div = document.createElement('div');
  div.className = 'gift-card';
  div.dataset.id = gift.id;
  div.dataset.price = gift.price;

  div.innerHTML = `
    <div class="gift-img-wrap">
      ${gift.imageUrl ? `<img src="${gift.imageUrl}" alt="${gift.name}" class="gift-image" />` : `<span style="position:relative;z-index:1">${gift.emoji || '🎁'}</span>`}
      ${gift.badge ? `<div class="gift-badge">${gift.badge}</div>` : ''}
      <button class="fav-btn ${isFaved ? 'saved' : ''}" data-id="${gift.id}" title="Save to favorites">
        ${isFaved ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="gift-body">
      <h3 class="gift-name">${gift.name}</h3>
      <p class="gift-desc">${gift.description}</p>
      <div class="gift-ai-reason"><strong>✦ Why it's perfect</strong> ${gift.reason}</div>
      <div class="gift-footer">
        <div class="gift-price">${gift.priceLabel} <span>onwards</span></div>
        <a href="#" class="btn-buy" data-gift-id="${gift.id}" data-link="${gift.link}">Buy Now →</a>
      </div>
    </div>
  `;

  const favBtn = div.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(gift, favBtn);
  });

  div.addEventListener('mouseenter', () => addToRecentlyViewed(gift));
  return div;
}

function showPurchaseConfirmation(gift) {
  state.pendingPurchaseGift = gift;
  const emoji = $('#purchaseGiftEmoji');
  const name = $('#purchaseGiftName');
  const price = $('#purchaseGiftPrice');
  const reason = $('#purchaseGiftReason');
  const details = $('#purchaseGiftDetails');
  const receipt = $('#receiptPanel');
  const confirmBtn = $('#confirmPurchaseBtn');
  const cancelBtn = $('#cancelPurchaseBtn');

  if (emoji) emoji.textContent = gift.emoji || '🎁';
  if (name) name.textContent = gift.name;
  if (price) price.textContent = gift.priceLabel || 'Price unavailable';
  if (reason) reason.textContent = gift.reason || 'Review this gift before confirming your demo payment.';
  if (details) details.textContent = `Confirm the demo payment for ${gift.name}. A sample receipt will be generated instantly.`;
  if (receipt) receipt.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.style.display = 'inline-flex';
    confirmBtn.textContent = 'Confirm Demo Payment';
  }
  if (cancelBtn) cancelBtn.textContent = 'Cancel';

  window.location.hash = '#purchase';
}

function confirmPurchase() {
  const gift = state.pendingPurchaseGift;
  if (!gift) return;

  addToRecentlyViewed(gift);
  renderDemoReceipt(gift);
  showToast(`Demo receipt created for ${gift.name}`);
}

function renderDemoReceipt(gift) {
  const receipt = $('#receiptPanel');
  const confirmBtn = $('#confirmPurchaseBtn');
  const cancelBtn = $('#cancelPurchaseBtn');
  const receiptNumber = `INC-${Date.now().toString().slice(-6)}`;
  const receiptDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  $('#receiptNumber').textContent = receiptNumber;
  $('#receiptDate').textContent = receiptDate;
  $('#receiptItem').textContent = gift.name;
  $('#receiptTotal').textContent = gift.priceLabel || 'Price unavailable';

  if (receipt) receipt.style.display = 'block';
  if (confirmBtn) confirmBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.textContent = 'Back to Gifts';
}

function getGiftFromCard(card, btn) {
  const id = btn.dataset.giftId ? parseInt(btn.dataset.giftId, 10) : null;
  if (id && state.currentResults.length) {
    const existing = state.currentResults.find(g => g.id === id);
    if (existing) return existing;
  }

  const name = card.querySelector('.gift-name')?.textContent?.trim() || 'Gift item';
  const priceLabel = card.querySelector('.gift-price')?.textContent?.trim() || 'Price unavailable';
  const emoji = card.querySelector('.gift-img-wrap span')?.textContent?.trim() || '🎁';
  const reason = card.querySelector('.gift-ai-reason')?.textContent?.trim() || '';
  const link = btn.dataset.link || btn.href || '#';

  return { id: id || Date.now(), name, priceLabel, emoji, reason, link };
}

function initBuyButtons() {
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.btn-buy');
    if (!btn) return;
    const card = btn.closest('.gift-card');
    if (!card) return;
    event.preventDefault();

    const gift = getGiftFromCard(card, btn);
    showPurchaseConfirmation(gift);
  });
}

function cancelPurchase() {
  state.pendingPurchaseGift = null;
  const receipt = $('#receiptPanel');
  if (receipt) receipt.style.display = 'none';
  window.location.hash = '#home';
}

/* ─── FAVORITES ──────────────────────────── */
function toggleFavorite(gift, btn) {
  const idx = state.favorites.findIndex(f => f.id === gift.id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    btn.classList.remove('saved');
    btn.textContent = '🤍';
    showToast(`Removed "${gift.name}" from saved`);
  } else {
    state.favorites.push({ id: gift.id, name: gift.name, emoji: gift.emoji || '🎁', priceLabel: gift.priceLabel });
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
        <div class="modal-gift-info"><strong>${fav.name}</strong><span>${fav.priceLabel}</span></div>
        <button class="btn-buy" onclick="window.open('#','_blank')" style="font-size:.78rem;padding:8px 14px;">Buy →</button>
      `;
      body.appendChild(item);
    });
  }
  $('#favsModal').classList.add('open');
}

/* ─── RECENTLY VIEWED ────────────────────── */
function addToRecentlyViewed(gift) {
  state.recentlyViewed = state.recentlyViewed.filter(g => g.id !== gift.id);
  state.recentlyViewed.unshift({ id: gift.id, name: gift.name, emoji: gift.emoji || '🎁', priceLabel: gift.priceLabel });
  state.recentlyViewed = state.recentlyViewed.slice(0, 6);
  localStorage.setItem('incanto_recent', JSON.stringify(state.recentlyViewed));
}

function renderRecentlyViewed() {
  if (state.recentlyViewed.length === 0) return;
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
  $('#recentSection').style.display = 'block';
}

/* ─── FINDER ─────────────────────────────── */
function initFinder() {
  $$('#step-1 .choice-btn, #step-2 .choice-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const stepId = this.closest('.finder-step').id;
      $$(`#${stepId} .choice-btn`).forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      if (stepId === 'step-1') {
        state.inputs.occasion = this.dataset.value;
        $('#next1').disabled = false;
        updateRecipientOptions(this.dataset.value);
      } else if (stepId === 'step-2') {
        state.inputs.recipient = this.dataset.value;
        $('#next2').disabled = false;
      }
    });
  });

  $$('.tag-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('selected');
      const val = this.dataset.value;
      if (this.classList.contains('selected')) state.inputs.interests.push(val);
      else state.inputs.interests = state.inputs.interests.filter(i => i !== val);
    });
  });

  $$('.pers-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.pers-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      state.inputs.personality = this.dataset.value;
    });
  });

  $$('.btn-next').forEach(btn => {
    btn.addEventListener('click', function () {
      goToStep(parseInt(this.id.replace('next', '')) + 1);
    });
  });

  $$('.btn-back').forEach(btn => {
    btn.addEventListener('click', function () {
      goToStep(parseInt(this.closest('.finder-step').id.split('-')[1]) - 1);
    });
  });

  $('#findGifts').addEventListener('click', () => {
    generateResults();
  });

  $('#restartBtn').addEventListener('click', restartFinder);
  $('#loadMoreBtn').addEventListener('click', loadMoreGifts);
  $('#viewFavsBtn').addEventListener('click', openFavoritesModal);
  $('#modalClose').addEventListener('click', () => $('#favsModal').classList.remove('open'));
  $('#favsModal').addEventListener('click', (e) => { if (e.target === $('#favsModal')) $('#favsModal').classList.remove('open'); });
}

function goToStep(step) {
  if (step < 1 || step > state.totalSteps) return;
  $(`.pstep[data-step="${state.currentStep}"]`).classList.remove('active');
  $(`.pstep[data-step="${state.currentStep}"]`).classList.add('completed');
  state.currentStep = step;
  $$('.finder-step').forEach(s => s.classList.remove('active'));
  $(`#step-${step}`).classList.add('active');
  $$('.pstep').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (n < step) s.classList.add('completed');
    if (n === step) s.classList.add('active');
  });
  $('#progressFill').style.width = `${((step - 1) / (state.totalSteps - 1)) * 100}%`;
  const navbarHeight = 68;
  const elementPosition = $('#finder').getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
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
  const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(90deg, var(--rose) 0%, var(--gold) ${pct}%, var(--border) ${pct}%)`;
}

/* ─── FILTERS ────────────────────────────── */
function initFilters() {
  $$('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      $$('.btn-filter').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      $$('.gift-card').forEach(card => {
        const price = parseInt(card.dataset.price);
        const f = this.dataset.filter;
        let show = true;
        if (f === 'under2k') show = price < 2000;
        else if (f === '2kto5k') show = price >= 2000 && price <= 5000;
        else if (f === 'above5k') show = price > 5000;
        card.style.display = show ? 'block' : 'none';
      });
    });
  });
}

/* ─── LOAD MORE ──────────────────────────── */
function loadMoreGifts() {
  const btn = $('#loadMoreBtn');
  btn.textContent = 'Loading more...';
  btn.disabled = true;
  setTimeout(() => {
    const currentIds = state.currentResults.map(g => g.id);
    const more = GIFT_DATABASE.filter(g => !currentIds.includes(g.id)).slice(0, 3);
    if (more.length > 0) {
      const grid = $('#giftsGrid');
      more.forEach((gift, idx) => {
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
  }, 500);
}

/* ─── RESTART ────────────────────────────── */
function restartFinder() {
  state.inputs = { occasion: null, recipient: null, budget: 2500, interests: [], personality: null };
  state.currentStep = 1;
  state.currentResults = [];
  $$('.choice-btn, .tag-btn, .pers-btn').forEach(b => b.classList.remove('selected'));
  $$('.btn-next').forEach(b => b.disabled = true);
  $('#next3').disabled = false;
  $('#budgetSlider').value = 2500;
  $('#budgetVal').textContent = '2,500';
  $$('.preset-btn').forEach(b => b.classList.remove('active'));
  $$('.finder-step').forEach(s => s.classList.remove('active'));
  $('#step-1').classList.add('active');
  $$('.pstep').forEach(s => s.classList.remove('active', 'completed'));
  $('.pstep[data-step="1"]').classList.add('active');
  $('#progressFill').style.width = '0%';
  $('#results').style.display = 'none';
  const navbarHeight = 68;
  const elementPosition = $('#finder').getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
}

/* ─── NAVBAR ─────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!navbar || !hamburger || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  };

  const toggleMenu = () => {
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
  };

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  // Hamburger click
  hamburger.addEventListener('click', toggleMenu);

  // Close when clicking links
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ─── SCROLL REVEAL ──────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal').forEach(el => observer.observe(el));
}

/* ─── TOAST ──────────────────────────────── */
function showToast(message, duration = 2800) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── ROUTING ────────────────────────────── */
function handleRouting() {
  const hash = window.location.hash || '#home';
  const targetId = hash.replace('#', '');
  const isHomeView = ['home','hero','how','finder','results','profile','about'].includes(targetId);
  
  // Handle view-section (main pages like home)
  $$('.view-section').forEach(sec => sec.classList.toggle('active', sec.id === (isHomeView ? 'home' : targetId)));
  
  // Handle page-section (secondary pages like purchase, trending)
  $$('.page-section').forEach(sec => sec.classList.toggle('active', sec.id === targetId));
  
  if (!document.querySelector('.view-section.active')) $('#home')?.classList.add('active');
  
  if (isHomeView && targetId !== 'home') {
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const navbarHeight = 68;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
      }
    }, 10);
  } else if (targetId === 'trending') {
    setTimeout(() => {
      const el = $('#trending');
      if (el) {
        const navbarHeight = 68;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
      }
    }, 10);
  } else {
    window.scrollTo({ top: 0 });
  }
  $('#mobileMenu')?.classList.remove('open');
}

window.addEventListener('hashchange', handleRouting);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('#favsModal').classList.remove('open');
    if (window.location.hash === '#purchase') cancelPurchase();
  }
});

/* ─── INIT ───────────────────────────────── */
function initLoginModal() {
  const loginBtn = document.getElementById('loginBtn');
  const modal = document.getElementById('loginModal');
  const closeBtn = document.getElementById('closeLogin');

  if (!loginBtn || !modal || !closeBtn) return;

  loginBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove('active');
    }
  });
}
function handleGoogleLogin(response) {
  const idToken = response.credential;

  console.log("Google ID Token:", idToken);

  // Later send this token to backend for verification
  localStorage.setItem("google_id_token", idToken);

  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("active");

  alert("Google login successful!");
}

function initGoogleLogin() {
  if (!window.google) return;

  google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID_HERE",
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("googleLoginBtn"),
    {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 280
    }
  );
}
document.addEventListener('DOMContentLoaded', () => {
  initGoogleLogin();
  initNavbar();
  initScrollReveal();
  initFinder();
  initBudgetSlider();
  initFilters();
  updateFavoritesUI();
  initBuyButtons();
  $('#confirmPurchaseBtn')?.addEventListener('click', confirmPurchase);
  $('#cancelPurchaseBtn')?.addEventListener('click', cancelPurchase);
  handleRouting();
  // SIMPLE LOGIN SYSTEM
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  state.isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

  if (state.isAuthenticated) {
    loginBtn.textContent = "Logout";
  }

  loginBtn.addEventListener("click", () => {
    if (state.isAuthenticated) {
      localStorage.removeItem("isLoggedIn");
      state.isAuthenticated = false;
      alert("Logged out");
      loginBtn.textContent = "Login";
      return;
    }

    const username = prompt("Enter username:");
    const password = prompt("Enter password:");

    if (username === "admin" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      state.isAuthenticated = true;
      alert("Login successful!");
      loginBtn.textContent = "Logout";
    } else {
      alert("Wrong credentials!");
    }
  });
}
});
