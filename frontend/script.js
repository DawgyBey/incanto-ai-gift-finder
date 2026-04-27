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
  cart: JSON.parse(localStorage.getItem('incanto_cart') || '[]'),
  currentResults: [],
  pendingPurchaseGift: null,
  isAuthenticated: window.IncantoAuth?.isAuthenticated() || false,
  user: window.IncantoAuth?.getUser() || null
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
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = window.IncantoAuth?.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
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
        imageUrl: null,
        emoji: '🎁',
        price: g.price,
        priceLabel: g.price ? `Rs. ${g.price.toLocaleString()}` : 'Price unavailable',
        category: g.category || 'Gift',
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
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  $$('.gift-card').forEach((card, idx) => { card.style.animationDelay = `${idx * 0.1}s`; });
  renderCart();
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
        <button class="btn-cart" type="button" data-gift-id="${gift.id}">Add to Cart</button>
        <a href="#" class="btn-buy" data-gift-id="${gift.id}" data-link="${gift.link}">Buy Now →</a>
      </div>
    </div>
  `;

  const favBtn = div.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(gift, favBtn);
  });

  div.querySelector('.btn-cart')?.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(gift);
  });

  div.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) return;
    addToRecentlyViewed(gift);
    renderRecentlyViewed();
  });
  return div;
}

function showPurchaseConfirmation(gift) {
  state.pendingPurchaseGift = gift;
  const emoji = $('#purchaseGiftEmoji');
  const name = $('#purchaseGiftName');
  const price = $('#purchaseGiftPrice');
  const reason = $('#purchaseGiftReason');
  const details = $('#purchaseGiftDetails');

  if (emoji) emoji.textContent = gift.emoji || '🎁';
  if (name) name.textContent = gift.name;
  if (price) price.textContent = gift.priceLabel || 'Price unavailable';
  if (reason) reason.textContent = gift.reason || 'You are about to leave INCANTO to complete this purchase on a trusted partner site.';
  if (details) details.textContent = `Confirm purchase and proceed to checkout for ${gift.name}. This will open the seller page in a new tab.`;

  window.location.hash = '#purchase';
}

function confirmPurchase() {
  const gift = state.pendingPurchaseGift;
  if (!gift) return;
  const targetLink = gift.link?.trim();
  if (!targetLink || targetLink === '#') {
    showToast('Sorry, this item does not have a checkout link yet. Please choose another gift.');
    return;
  }

  addToRecentlyViewed(gift);
  window.open(targetLink, '_blank', 'noopener');
  showToast(`Redirecting to checkout for ${gift.name}`);
  state.pendingPurchaseGift = null;
  window.location.hash = '#home';
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

    if (!state.isAuthenticated) {
      showToast('Please sign in to purchase gifts.');
      showAuthModal('login');
      return;
    }

    const gift = getGiftFromCard(card, btn);
    showPurchaseConfirmation(gift);
  });
}

function cancelPurchase() {
  state.pendingPurchaseGift = null;
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
function normalizeGiftForStorage(gift) {
  return {
    id: gift.id,
    name: gift.name,
    description: gift.description || '',
    category: gift.category || 'Gift',
    emoji: gift.emoji || 'ðŸŽ',
    price: gift.price || null,
    priceLabel: gift.priceLabel || 'Price unavailable',
    reason: gift.reason || '',
    link: gift.link || '#',
  };
}

function addToCart(gift) {
  const existing = state.cart.find(item => item.id === gift.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.unshift({ ...normalizeGiftForStorage(gift), quantity: 1, addedAt: new Date().toISOString() });
  }
  localStorage.setItem('incanto_cart', JSON.stringify(state.cart));
  if (state.isAuthenticated) {
    apiFetch('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ gift: normalizeGiftForStorage(gift) }),
    }).catch(() => {});
  }
  renderCart();
  showToast(`Added "${gift.name}" to cart`);
}

function removeFromCart(giftId) {
  state.cart = state.cart.filter(item => String(item.id) !== String(giftId));
  localStorage.setItem('incanto_cart', JSON.stringify(state.cart));
  if (state.isAuthenticated) {
    apiFetch(`/users/cart/${encodeURIComponent(giftId)}`, { method: 'DELETE' }).catch(() => {});
  }
  renderCart();
}

function renderCart() {
  const section = $('#cartSection');
  const grid = $('#cartGrid');
  const count = $('#cartCount');
  if (!section || !grid || !count) return;

  const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  count.textContent = totalItems;

  if (state.cart.length === 0) {
    section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = '';
  state.cart.forEach(item => {
    const card = document.createElement('div');
    card.className = 'cart-card';
    card.innerHTML = `
      <div class="cart-emoji">${escapeHtml(item.emoji)}</div>
      <div class="cart-info">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.priceLabel)} · Qty ${item.quantity || 1}</span>
      </div>
      <button class="cart-remove" type="button" data-id="${escapeHtml(item.id)}">Remove</button>
    `;
    card.querySelector('.cart-remove')?.addEventListener('click', () => removeFromCart(item.id));
    grid.appendChild(card);
  });
  section.style.display = 'block';
}

/* ─── FINDER ─────────────────────────────── */
function addToRecentlyViewed(gift) {
  state.recentlyViewed = state.recentlyViewed.filter(item => item.id !== gift.id);
  state.recentlyViewed.unshift({
    ...normalizeGiftForStorage(gift),
    viewedAt: new Date().toISOString(),
  });
  state.recentlyViewed = state.recentlyViewed.slice(0, 6);
  localStorage.setItem('incanto_recent', JSON.stringify(state.recentlyViewed));
  if (state.isAuthenticated) {
    apiFetch('/users/recently-viewed', {
      method: 'POST',
      body: JSON.stringify({ gift: normalizeGiftForStorage(gift) }),
    }).catch(() => {});
  }
}

function renderRecentlyViewed() {
  const grid = $('#recentGrid');
  const section = $('#recentSection');
  if (!grid || !section) return;

  if (state.recentlyViewed.length === 0) {
    section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = '';
  state.recentlyViewed.forEach(gift => {
    const viewedDate = gift.viewedAt
      ? new Date(gift.viewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : 'Recent';
    const card = document.createElement('div');
    card.className = 'recent-card';
    card.innerHTML = `
      <div class="recent-emoji">${escapeHtml(gift.emoji || 'Gift')}</div>
      <div class="recent-meta">${escapeHtml(gift.category || 'Gift')} · ${escapeHtml(viewedDate)}</div>
      <div class="recent-name">${escapeHtml(gift.name || 'Gift item')}</div>
      <div class="recent-desc">${escapeHtml(gift.description || gift.reason || 'Recommended from your latest gift search.')}</div>
      <div class="recent-footer">
        <div class="recent-price">${escapeHtml(gift.priceLabel || 'Price unavailable')}</div>
        <button class="recent-buy" type="button">View</button>
      </div>
    `;
    card.querySelector('.recent-buy')?.addEventListener('click', () => showPurchaseConfirmation(gift));
    grid.appendChild(card);
  });
  section.style.display = 'block';
}

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
  $('#finder').scrollIntoView({ behavior: 'smooth' });
}

/* ─── NAVBAR ─────────────────────────────── */
function initNavbar() {
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
  const ham = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  ham.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('open')));
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
function showAuthModal(mode = 'login') {
  setAuthMode(mode);
  $('#authModal')?.classList.add('open');
}

function hideAuthModal() {
  $('#authModal')?.classList.remove('open');
}

function setAuthMode(mode) {
  const isRegister = mode === 'register';
  $('#authModalTitle').textContent = isRegister ? 'Create account' : 'Log in';
  $('#authLoginTab').classList.toggle('active', !isRegister);
  $('#authRegisterTab').classList.toggle('active', isRegister);
  $('#loginForm').classList.toggle('active', !isRegister);
  $('#registerForm').classList.toggle('active', isRegister);
}

function updateProfileUI(user = state.user) {
  $('#profileUsername').textContent = user?.username || '';
  $('#profileEmail').textContent = user?.email || '';
  $('#profileVerified').textContent = user?.verified ? 'Yes' : 'No';

  const info = user?.personalInfo || {};
  $('#personalFullName').value = info.fullName || user?.username || '';
  $('#personalPhone').value = info.phone || '';
  $('#personalBirthday').value = info.birthday || '';
  $('#personalLocation').value = info.location || '';

  const prefs = user?.preferences || {};
  if ($('#prefRecipient')) $('#prefRecipient').value = prefs.recipient || '';
  if ($('#prefBudget')) $('#prefBudget').value = prefs.budget || '';
  if ($('#prefInterests')) $('#prefInterests').value = Array.isArray(prefs.interests) ? prefs.interests.join(', ') : '';
  if ($('#prefPersonality')) $('#prefPersonality').value = prefs.personality || '';
}

function updateAuthUI() {
  state.isAuthenticated = window.IncantoAuth?.isAuthenticated() || false;
  state.user = window.IncantoAuth?.getUser() || null;
  if (state.user?.cart) {
    state.cart = state.user.cart;
    localStorage.setItem('incanto_cart', JSON.stringify(state.cart));
  }
  if (state.user?.recentlyViewed) {
    state.recentlyViewed = state.user.recentlyViewed;
    localStorage.setItem('incanto_recent', JSON.stringify(state.recentlyViewed));
  }

  $('#loginBtn').style.display = state.isAuthenticated ? 'none' : 'inline-flex';
  $('#mobileLoginBtn').style.display = state.isAuthenticated ? 'none' : 'block';
  $('#profileBtn').style.display = state.isAuthenticated ? 'inline-flex' : 'none';
  $('#mobileProfileBtn').style.display = state.isAuthenticated ? 'block' : 'none';
  $('#logoutBtn').style.display = state.isAuthenticated ? 'inline-flex' : 'none';
  updateProfileUI();
}

async function handleAuthSubmit(formType, event) {
  event.preventDefault();
  const submit = event.target.querySelector('button[type="submit"]');
  const originalText = submit.textContent;
  submit.disabled = true;
  submit.textContent = formType === 'register' ? 'Creating...' : 'Logging in...';

  try {
    if (formType === 'register') {
      await window.IncantoAuth.register({
        username: $('#registerUsername').value.trim(),
        email: $('#registerEmail').value.trim(),
        password: $('#registerPassword').value,
      });
      showToast('Account created. You are signed in.');
    } else {
      await window.IncantoAuth.login({
        email: $('#loginEmail').value.trim(),
        password: $('#loginPassword').value,
      });
      showToast('Welcome back.');
    }
    hideAuthModal();
    updateAuthUI();
  } catch (err) {
    showToast(err.message || 'Authentication failed.');
  } finally {
    submit.disabled = false;
    submit.textContent = originalText;
  }
}

async function saveProfilePreferences(event) {
  event.preventDefault();
  if (!state.isAuthenticated) {
    showAuthModal('login');
    return;
  }

  const interests = $('#prefInterests').value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const { ok, data } = await apiFetch('/users/preferences', {
    method: 'POST',
    body: JSON.stringify({
      recipient: $('#prefRecipient').value,
      budget: $('#prefBudget').value,
      interests,
      personality: $('#prefPersonality').value,
    }),
  });

  if (ok && data.success) {
    localStorage.setItem('incanto_user', JSON.stringify(data.data.user));
    updateAuthUI();
    showToast('Preferences saved.');
  } else {
    showToast(data.message || 'Could not save preferences.');
  }
}

async function savePersonalInfo(event) {
  event.preventDefault();
  if (!state.isAuthenticated) {
    showAuthModal('login');
    return;
  }

  const { ok, data } = await apiFetch('/users/personal-info', {
    method: 'POST',
    body: JSON.stringify({
      fullName: $('#personalFullName').value,
      phone: $('#personalPhone').value,
      birthday: $('#personalBirthday').value,
      location: $('#personalLocation').value,
    }),
  });

  if (ok && data.success) {
    localStorage.setItem('incanto_user', JSON.stringify(data.data.user));
    updateAuthUI();
    showToast('Personal information saved.');
  } else {
    showToast(data.message || 'Could not save personal information.');
  }
}

function initGoogleSignIn() {
  const clientId = window.IncantoAuth?.GOOGLE_CLIENT_ID;
  const googleWrap = $('#googleButtonWrap');
  const setupBtn = $('#googleSetupBtn');

  if (!clientId || !window.google?.accounts?.id) {
    setupBtn.style.display = 'inline-flex';
    return;
  }

  setupBtn.style.display = 'none';
  $('#googleNote').style.display = 'none';

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response) => {
      try {
        await window.IncantoAuth.loginWithGoogle(response.credential);
        hideAuthModal();
        updateAuthUI();
        showToast('Signed in with Google.');
      } catch (err) {
        showToast(err.message || 'Google sign-in failed.');
      }
    },
  });
  window.google.accounts.id.renderButton(googleWrap, {
    theme: 'filled_black',
    size: 'large',
    width: Math.min(360, googleWrap.clientWidth || 360),
  });
}

function initAuth() {
  $('#loginBtn')?.addEventListener('click', () => showAuthModal('login'));
  $('#mobileLoginBtn')?.addEventListener('click', () => showAuthModal('login'));
  $('#logoutBtn')?.addEventListener('click', () => {
    window.IncantoAuth.logout();
    updateAuthUI();
    showToast('Signed out.');
    if (window.location.hash === '#profile') window.location.hash = '#home';
  });
  $('#authModalClose')?.addEventListener('click', hideAuthModal);
  $('#authModal')?.addEventListener('click', (event) => { if (event.target === $('#authModal')) hideAuthModal(); });
  $('#authLoginTab')?.addEventListener('click', () => setAuthMode('login'));
  $('#authRegisterTab')?.addEventListener('click', () => setAuthMode('register'));
  $('#loginForm')?.addEventListener('submit', (event) => handleAuthSubmit('login', event));
  $('#registerForm')?.addEventListener('submit', (event) => handleAuthSubmit('register', event));
  $('#personalInfoForm')?.addEventListener('submit', savePersonalInfo);
  $('#preferencesForm')?.addEventListener('submit', saveProfilePreferences);
  $('#googleSetupBtn')?.addEventListener('click', () => showToast('Paste your Google OAuth client ID in frontend/user.js first.'));
  window.addEventListener('incanto:auth-change', updateAuthUI);
  window.addEventListener('load', initGoogleSignIn);
  updateAuthUI();
}

function handleRouting() {
  const hash = window.location.hash || '#home';
  const targetId = hash.replace('#', '');
  if (targetId === 'profile' && !state.isAuthenticated) {
    showAuthModal('login');
    window.location.hash = '#home';
    return;
  }
  const isHomeView = ['home','hero','how','finder','results','about'].includes(targetId);
  $$('.view-section').forEach(sec => sec.classList.toggle('active', sec.id === (isHomeView ? 'home' : targetId)));
  if (!document.querySelector('.view-section.active')) $('#home')?.classList.add('active');
  if (isHomeView && targetId !== 'home') {
    setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 10);
  } else {
    window.scrollTo({ top: 0 });
  }
  $('#mobileMenu')?.classList.remove('open');
}

window.addEventListener('hashchange', handleRouting);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('#favsModal').classList.remove('open');
    hideAuthModal();
    if (window.location.hash === '#purchase') cancelPurchase();
  }
});

/* ─── INIT ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initFinder();
  initBudgetSlider();
  initFilters();
  initAuth();
  updateFavoritesUI();
  renderCart();
  renderRecentlyViewed();
  initBuyButtons();
  $('#confirmPurchaseBtn')?.addEventListener('click', confirmPurchase);
  $('#cancelPurchaseBtn')?.addEventListener('click', cancelPurchase);
  handleRouting();
});
