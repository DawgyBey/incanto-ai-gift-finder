/* ══════════════════════════════════════════
   INCANTO – AI Gift Finder (Standalone)
   No backend required - uses mock data
   ══════════════════════════════════════════ */

   'use strict';

   /* ─── MOCK GIFT DATABASE ─────────────────── */
   const GIFT_DATABASE = [
     { id: 1, name: "Aura Noise Cancelling Headphones", description: "Premium wireless headphones with spatial audio tracking.", emoji: "🎧", price: 8500, priceLabel: "Rs. 8,500", badge: "#1 Trending", reason: "Perfect for music lovers and remote workers.", link: "#" },
     { id: 2, name: "Artisan Coffee Brewing Kit", description: "Complete pour-over setup with freshly roasted Himalayan beans.", emoji: "☕", price: 3200, priceLabel: "Rs. 3,200", badge: "Hot Pick", reason: "Ideal for coffee enthusiasts and morning rituals.", link: "#" },
     { id: 3, name: "Smart Desktop Planter", description: "Self-watering indoor planter with LED grow lights.", emoji: "🪴", price: 4500, priceLabel: "Rs. 4,500", badge: "Fast Seller", reason: "Great for plant lovers with busy schedules.", link: "#" },
     { id: 4, name: "Chunky Knit Weighted Blanket", description: "Cozy, temperature-regulating weighted blanket for deep sleep.", emoji: "🧶", price: 6800, priceLabel: "Rs. 6,800", badge: "Highly Rated", reason: "Provides comfort and reduces anxiety.", link: "#" },
     { id: 5, name: "Vintage Instant Film Camera", description: "A retro-style instant camera with modern autofocus features.", emoji: "📷", price: 12000, priceLabel: "Rs. 12,000", badge: "Nostalgia Pick", reason: "Creates tangible memories in a digital world.", link: "#" },
     { id: 6, name: "Gourmet Himalayan Truffles", description: "Handcrafted chocolates made with local nuts and berries.", emoji: "🍫", price: 1500, priceLabel: "Rs. 1,500", badge: "Local Favorite", reason: "Sweet treat that feels luxurious and personal.", link: "#" },
     { id: 7, name: "Aromatherapy Diffuser Set", description: "Ultrasonic essential oil diffuser with 6 premium oils.", emoji: "🌸", price: 2800, priceLabel: "Rs. 2,800", badge: "Wellness Pick", reason: "Creates a calming atmosphere for relaxation.", link: "#" },
     { id: 8, name: "Wireless Charging Pad", description: "Fast-charging 3-in-1 wireless charger for all devices.", emoji: "⚡", price: 3500, priceLabel: "Rs. 3,500", badge: "Tech Essential", reason: "Practical gift for the organized tech user.", link: "#" },
     { id: 9, name: "Personalized Star Map", description: "Custom print of the night sky from a special date.", emoji: "⭐", price: 4200, priceLabel: "Rs. 4,200", badge: "Sentimental", reason: "Captures a meaningful moment forever.", link: "#" },
     { id: 10, name: "Leather Journal Set", description: "Hand-bound leather journal with fountain pen.", emoji: "📓", price: 1900, priceLabel: "Rs. 1,900", badge: "Creative", reason: "For the writer or dreamer in your life.", link: "#" }
   ];
   
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
     handleRouting();
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
   
     const ham = $('#hamburger');
     const mobileMenu = $('#mobileMenu');
     ham.addEventListener('click', () => {
       mobileMenu.classList.toggle('open');
     });
   
     $$('.mobile-link').forEach(link => {
       link.addEventListener('click', () => mobileMenu.classList.remove('open'));
     });
   
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
   
     $$('.pers-btn').forEach(btn => {
       btn.addEventListener('click', function () {
         $$('.pers-btn').forEach(b => b.classList.remove('selected'));
         this.classList.add('selected');
         state.inputs.personality = this.dataset.value;
       });
     });
   
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
   
     $('#findGifts').addEventListener('click', () => {
       generateResults();
     });
   
     $('#restartBtn').addEventListener('click', restartFinder);
     $('#loadMoreBtn').addEventListener('click', loadMoreGifts);
   
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
     if (step < 1 || step > state.totalSteps) return;
   
     $(`.pstep[data-step="${state.currentStep}"]`).classList.remove('active');
     $(`.pstep[data-step="${state.currentStep}"]`).classList.add('completed');
   
     state.currentStep = step;
   
     $$('.finder-step').forEach(s => s.classList.remove('active'));
     $(`#step-${step}`).classList.add('active');
   
     $$('.pstep').forEach(s => {
       const sNum = parseInt(s.dataset.step);
       s.classList.remove('active', 'completed');
       if (sNum < step) s.classList.add('completed');
       if (sNum === step) s.classList.add('active');
     });
   
     const pct = ((step - 1) / (state.totalSteps - 1)) * 100;
     $('#progressFill').style.width = `${pct}%`;
   
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
     const min = slider.min;
     const max = slider.max;
     const value = slider.value;
     const pct = ((value - min) / (max - min)) * 100;
     slider.style.background = `linear-gradient(90deg, var(--rose) 0%, var(--gold) ${pct}%, var(--border) ${pct}%)`;
   }
   
   /* ─── GENERATE RESULTS (Mock) ───────────────────── */
   async function generateResults() {
     const overlay = $('#loadingOverlay');
     overlay.classList.add('active');
   
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
   
     // Simulate API delay
     setTimeout(() => {
       clearInterval(msgInterval);
       overlay.classList.remove('active');
   
       // Filter gifts based on budget
       let filteredGifts = GIFT_DATABASE.filter(g => g.price <= state.inputs.budget + 2000);
       
       // Sort by relevance (price proximity to budget)
       filteredGifts.sort((a, b) => {
         return Math.abs(a.price - state.inputs.budget) - Math.abs(b.price - state.inputs.budget);
       });
       
       // Take top 6
       const recommendations = filteredGifts.slice(0, 6);
       
       state.currentResults = recommendations;
       displayResults(recommendations);
       showToast(`Found ${recommendations.length} perfect gift ideas! 🎁`);
     }, 2000);
   }
   
   function displayResults(gifts) {
     const section = $('#results');
     const grid = $('#giftsGrid');
     const title = $('#resultsTitle');
   
     const recipientNames = {
       partner: 'your partner', friend: 'your friend', mom: 'mom',
       dad: 'dad', sibling: 'your sibling', colleague: 'your colleague',
       child: 'the little one', grandparent: 'grandma or grandpa'
     };
   
     const recipient = state.inputs.recipient;
     if (recipient && recipientNames[recipient]) {
       title.textContent = `Perfect gifts for ${recipientNames[recipient]} ✨`;
     }
   
     grid.innerHTML = '';
     gifts.forEach((gift, idx) => {
       const card = createGiftCard(gift, idx);
       grid.appendChild(card);
     });
   
     section.style.display = 'block';
     section.scrollIntoView({ behavior: 'smooth', block: 'start' });
   
     $$('.gift-card').forEach((card, idx) => {
       card.style.animationDelay = `${idx * 0.1}s`;
     });
   
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
           ${gift.reason}
         </div>
         <div class="gift-footer">
           <div class="gift-price">
             ${gift.priceLabel}
             <span>onwards</span>
           </div>
           <a href="${gift.link}" target="_blank" rel="noopener noreferrer" class="btn-buy" data-gift-id="${gift.id}">
             Buy Now →
           </a>
         </div>
       </div>
     `;
   
     div.querySelector('.fav-btn').addEventListener('click', function (e) {
       e.stopPropagation();
       toggleFavorite(gift, this);
     });
   
     div.querySelector('.btn-buy').addEventListener('click', () => {
       addToRecentlyViewed(gift);
     });
   
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
           <button class="btn-buy" onclick="window.open('#', '_blank')" style="font-size:0.78rem;padding:8px 14px;">
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
     state.recentlyViewed = state.recentlyViewed.filter(g => g.id !== gift.id);
     state.recentlyViewed.unshift({ id: gift.id, name: gift.name, emoji: gift.emoji || '🎁', priceLabel: gift.priceLabel });
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
   function loadMoreGifts() {
     const btn = $('#loadMoreBtn');
     btn.textContent = 'Loading more...';
     btn.disabled = true;
   
     setTimeout(() => {
       const currentIds = state.currentResults.map(g => g.id);
       const moreGifts = GIFT_DATABASE.filter(g => !currentIds.includes(g.id)).slice(0, 3);
       
       if (moreGifts.length > 0) {
         const grid = $('#giftsGrid');
         moreGifts.forEach((gift, idx) => {
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
   
   /* ─── RESTART FINDER ─────────────────────── */
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
   
   /* ─── SURPRISE ME ────────────────────────── */
   function triggerSurprise() {
     const overlay = $('#loadingOverlay');
     overlay.classList.add('active');
     $('#loaderText').textContent = 'Preparing a surprise just for you... 🎲';
   
     setTimeout(() => {
       overlay.classList.remove('active');
       
       // Get random gifts
       const shuffled = [...GIFT_DATABASE].sort(() => 0.5 - Math.random());
       const surpriseGifts = shuffled.slice(0, 6);
       
       state.currentResults = surpriseGifts;
       $('#resultsTitle').textContent = 'Surprise picks, just for you 🎲';
   
       const grid = $('#giftsGrid');
       grid.innerHTML = '';
       surpriseGifts.forEach((gift, idx) => {
         const card = createGiftCard(gift, idx);
         card.style.animationDelay = `${idx * 0.1}s`;
         grid.appendChild(card);
       });
   
       $('#results').style.display = 'block';
       $('#results').scrollIntoView({ behavior: 'smooth' });
       showToast('🎲 Surprise gifts loaded!');
     }, 1000);
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
   
     if (isHomeView && targetId !== 'home') {
       setTimeout(() => {
         const el = document.getElementById(targetId);
         if(el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
       }, 10);
     } else {
       window.scrollTo({top: 0});
     }
   
     const mobileMenu = document.getElementById('mobileMenu');
     if (mobileMenu) mobileMenu.classList.remove('open');
   }
   
   window.addEventListener('hashchange', handleRouting);
   
   /* ─── KEYBOARD ACCESSIBILITY ─────────────── */
   document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       $('#favsModal').classList.remove('open');
     }
   });