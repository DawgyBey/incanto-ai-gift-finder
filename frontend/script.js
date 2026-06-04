// frontend-script.js

'use strict';

/* ─── CONFIG ─────────────────────────────── */
const API_BASE = window.INCANTO_API_BASE
  || (window.location.protocol === 'file:'
    || (['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port && window.location.port !== '5000')
    ? 'http://localhost:5000/api/v1'
    : `${window.location.origin}/api/v1`);
const IS_PAYMENT_PAGE = window.location.pathname.endsWith('/payment.html');
const PENDING_CHECKOUT_KEY_PREFIX = 'incanto_pending_checkout';

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

const REAL_WORLD_GIFT_DATABASE = [
  { id: 101, name: "JBL Go 4 Portable Bluetooth Speaker", description: "Compact waterproof speaker for music at home, picnics, and travel.", emoji: "🎵", price: 6200, priceLabel: "Rs. 6,200", category: "Audio", badge: "Real-world pick", tags: ["music", "tech", "travel", "adventurous", "trendy"], recipients: ["friend", "partner", "sibling", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=JBL%20Go%204%20speaker" },
  { id: 102, name: "Anker 20,000mAh Power Bank", description: "Reliable backup battery for commuters, students, and frequent travelers.", emoji: "🔋", price: 4800, priceLabel: "Rs. 4,800", category: "Tech", badge: "Practical", tags: ["tech", "travel", "practical", "adventurous"], recipients: ["friend", "dad", "sibling", "colleague", "partner"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Anker%2020000mAh%20power%20bank" },
  { id: 103, name: "Mi Smart Band Fitness Tracker", description: "Tracks steps, sleep, heart rate, and workouts without feeling bulky.", emoji: "⌚", price: 5600, priceLabel: "Rs. 5,600", category: "Fitness", badge: "Everyday useful", tags: ["fitness", "tech", "practical"], recipients: ["friend", "dad", "mom", "sibling", "partner"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Mi%20Smart%20Band" },
  { id: 104, name: "Non-slip Yoga Mat 6mm", description: "Cushioned mat for yoga, stretching, and home workouts.", emoji: "🧘", price: 1800, priceLabel: "Rs. 1,800", category: "Fitness", badge: "Budget friendly", tags: ["fitness", "practical", "nature"], recipients: ["mom", "friend", "partner", "sibling"], occasions: ["birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=yoga%20mat%206mm" },
  { id: 105, name: "Resistance Bands Set", description: "Five resistance levels for strength training at home or while traveling.", emoji: "💪", price: 950, priceLabel: "Rs. 950", category: "Fitness", badge: "Starter pick", tags: ["fitness", "travel", "practical"], recipients: ["friend", "sibling", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=resistance%20bands%20set" },
  { id: 106, name: "Ilam Tea Assortment Gift Box", description: "A real Nepali tea sampler with black, green, and masala blends.", emoji: "🍵", price: 1200, priceLabel: "Rs. 1,200", category: "Food", badge: "Local favorite", tags: ["cooking", "nature", "practical", "traditional"], recipients: ["mom", "dad", "grandparent", "colleague", "friend"], occasions: ["festival", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Ilam%20tea%20gift%20box" },
  { id: 107, name: "Single Origin Nepali Coffee Beans", description: "Locally roasted coffee for people who love slow mornings.", emoji: "☕", price: 1600, priceLabel: "Rs. 1,600", category: "Food", badge: "Real-world pick", tags: ["cooking", "practical", "intellectual"], recipients: ["dad", "friend", "colleague", "partner"], occasions: ["birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Nepal%20coffee%20beans" },
  { id: 108, name: "Borosil Glass Lunch Box Set", description: "Durable microwave-safe containers for office lunches and meal prep.", emoji: "🍱", price: 2600, priceLabel: "Rs. 2,600", category: "Kitchen", badge: "Office useful", tags: ["cooking", "practical"], recipients: ["mom", "dad", "colleague", "friend"], occasions: ["birthday", "wedding", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=glass%20lunch%20box%20set" },
  { id: 109, name: "Prestige Electric Kettle", description: "Fast hot water for tea, coffee, noodles, and hostel rooms.", emoji: "🫖", price: 2100, priceLabel: "Rs. 2,100", category: "Kitchen", badge: "Practical", tags: ["cooking", "practical"], recipients: ["friend", "sibling", "colleague", "mom", "dad"], occasions: ["graduation", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Prestige%20electric%20kettle" },
  { id: 110, name: "Lokta Paper Journal and Pen Set", description: "Handmade Nepali paper notebook for sketches, notes, and journaling.", emoji: "📓", price: 850, priceLabel: "Rs. 850", category: "Stationery", badge: "Handmade", tags: ["art", "books", "intellectual", "artistic", "sentimental"], recipients: ["friend", "sibling", "partner", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Lokta%20paper%20journal" },
  { id: 111, name: "Rechargeable Reading Light", description: "Clip-on light for night readers and students.", emoji: "📚", price: 1100, priceLabel: "Rs. 1,100", category: "Books", badge: "Reader pick", tags: ["books", "intellectual", "practical"], recipients: ["friend", "sibling", "child", "partner"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=rechargeable%20reading%20light" },
  { id: 112, name: "Moleskine Classic Notebook", description: "Premium notebook for planners, writers, designers, and students.", emoji: "✍️", price: 3200, priceLabel: "Rs. 3,200", category: "Stationery", badge: "Premium", tags: ["books", "art", "intellectual", "artistic"], recipients: ["friend", "partner", "colleague", "sibling"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Moleskine%20notebook" },
  { id: 113, name: "Mandala Art Kit", description: "Paints, pens, and guides for mindful creative evenings.", emoji: "🎨", price: 1400, priceLabel: "Rs. 1,400", category: "Art", badge: "Creative", tags: ["art", "artistic", "nature", "sentimental"], recipients: ["friend", "sibling", "child", "partner"], occasions: ["birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=mandala%20art%20kit" },
  { id: 114, name: "Custom Sketch Portrait Voucher", description: "Commission-style portrait gift for a memorable personal surprise.", emoji: "🖼️", price: 2500, priceLabel: "Rs. 2,500", category: "Art", badge: "Personal", tags: ["art", "photography", "romantic", "sentimental", "artistic"], recipients: ["partner", "mom", "dad", "friend", "grandparent"], occasions: ["anniversary", "birthday", "valentine", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=custom%20portrait%20sketch" },
  { id: 115, name: "Instax Mini Film Pack", description: "Instant photo film refill for memory-makers and party people.", emoji: "📷", price: 1800, priceLabel: "Rs. 1,800", category: "Photography", badge: "Memory maker", tags: ["photography", "travel", "art", "romantic", "sentimental"], recipients: ["friend", "partner", "sibling"], occasions: ["birthday", "anniversary", "valentine", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Instax%20mini%20film" },
  { id: 116, name: "Ulanzi Phone Tripod", description: "Compact tripod for photos, reels, video calls, and travel shots.", emoji: "📱", price: 2200, priceLabel: "Rs. 2,200", category: "Photography", badge: "Creator pick", tags: ["photography", "tech", "travel", "artistic"], recipients: ["friend", "sibling", "partner", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Ulanzi%20phone%20tripod" },
  { id: 117, name: "Himalayan Salt Lamp", description: "Warm ambient light for bedrooms, desks, and cozy corners.", emoji: "🕯️", price: 1900, priceLabel: "Rs. 1,900", category: "Home", badge: "Cozy", tags: ["nature", "romantic", "sentimental", "practical"], recipients: ["mom", "dad", "partner", "friend", "grandparent"], occasions: ["festival", "birthday", "anniversary", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Himalayan%20salt%20lamp" },
  { id: 118, name: "Indoor Plant Trio with Pots", description: "Low-maintenance plants for desks, windowsills, and new homes.", emoji: "🪴", price: 1800, priceLabel: "Rs. 1,800", category: "Home", badge: "Fresh", tags: ["nature", "art", "practical"], recipients: ["mom", "friend", "partner", "colleague", "grandparent"], occasions: ["birthday", "wedding", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=indoor%20plant%20trio" },
  { id: 119, name: "Organic Skincare Starter Set", description: "Gentle cleanser, toner, and moisturizer set for everyday care.", emoji: "✨", price: 3400, priceLabel: "Rs. 3,400", category: "Skincare", badge: "Self-care", tags: ["skincare", "nature", "practical", "romantic"], recipients: ["mom", "partner", "friend", "sibling"], occasions: ["birthday", "anniversary", "valentine", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=organic%20skincare%20set" },
  { id: 120, name: "The Ordinary Niacinamide Serum", description: "Popular skincare serum for oil control and smoother-looking skin.", emoji: "🧴", price: 2100, priceLabel: "Rs. 2,100", category: "Skincare", badge: "Trending", tags: ["skincare", "practical", "trendy"], recipients: ["friend", "partner", "sibling"], occasions: ["birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=The%20Ordinary%20Niacinamide" },
  { id: 121, name: "Pashmina Shawl", description: "Soft classic shawl for formal wear, travel, and cool evenings.", emoji: "🧣", price: 5500, priceLabel: "Rs. 5,500", category: "Fashion", badge: "Classic", tags: ["fashion", "romantic", "traditional", "sentimental"], recipients: ["mom", "partner", "grandparent"], occasions: ["anniversary", "festival", "birthday", "valentine"], link: "https://www.daraz.com.np/catalog/?q=pashmina%20shawl" },
  { id: 122, name: "Minimal Silver Pendant Necklace", description: "Simple everyday jewelry that works for dates and daily wear.", emoji: "💍", price: 3800, priceLabel: "Rs. 3,800", category: "Fashion", badge: "Romantic", tags: ["fashion", "romantic", "sentimental"], recipients: ["partner", "mom", "friend", "sibling"], occasions: ["anniversary", "valentine", "birthday"], link: "https://www.daraz.com.np/catalog/?q=silver%20pendant%20necklace" },
  { id: 123, name: "Hemp Drawstring Day Bag", description: "Locally made casual bag for college, markets, and short walks.", emoji: "🎒", price: 750, priceLabel: "Rs. 750", category: "Fashion", badge: "Local", tags: ["fashion", "travel", "nature", "artistic"], recipients: ["friend", "sibling", "child", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=hemp%20drawstring%20bag" },
  { id: 124, name: "Logitech Wireless Mouse", description: "A dependable work and study upgrade for laptop users.", emoji: "🖱️", price: 1900, priceLabel: "Rs. 1,900", category: "Tech", badge: "Work essential", tags: ["tech", "practical", "intellectual"], recipients: ["colleague", "friend", "dad", "sibling"], occasions: ["graduation", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Logitech%20wireless%20mouse" },
  { id: 125, name: "Redragon Gaming Mouse", description: "Responsive gaming mouse with programmable buttons and RGB lighting.", emoji: "🎮", price: 2300, priceLabel: "Rs. 2,300", category: "Gaming", badge: "Gaming", tags: ["gaming", "tech", "funny", "trendy"], recipients: ["friend", "sibling", "child", "partner"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=Redragon%20gaming%20mouse" },
  { id: 126, name: "Steam Gift Card Equivalent", description: "A flexible gaming credit idea for PC gamers who know what they want.", emoji: "🕹️", price: 3000, priceLabel: "Rs. 3,000", category: "Gaming", badge: "Flexible", tags: ["gaming", "tech", "funny"], recipients: ["friend", "sibling", "child", "partner"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=gaming%20gift%20card" },
  { id: 127, name: "Baby Milestone Blanket", description: "Photo-friendly blanket for tracking a baby's first months.", emoji: "👶", price: 1700, priceLabel: "Rs. 1,700", category: "Baby", badge: "Baby shower", tags: ["photography", "sentimental", "practical"], recipients: ["child", "partner", "mom"], occasions: ["babyshower"], link: "https://www.daraz.com.np/catalog/?q=baby%20milestone%20blanket" },
  { id: 128, name: "Newborn Care Hamper", description: "Soft towels, baby wash, and tiny essentials for new parents.", emoji: "🧸", price: 3500, priceLabel: "Rs. 3,500", category: "Baby", badge: "Useful", tags: ["skincare", "practical", "sentimental"], recipients: ["child", "partner", "mom"], occasions: ["babyshower"], link: "https://www.daraz.com.np/catalog/?q=newborn%20care%20hamper" },
  { id: 129, name: "Dried Fruit and Nut Hamper", description: "Premium snack hamper that works for family visits and festivals.", emoji: "🎁", price: 2600, priceLabel: "Rs. 2,600", category: "Food", badge: "Festival", tags: ["cooking", "traditional", "practical"], recipients: ["mom", "dad", "grandparent", "colleague", "friend"], occasions: ["festival", "wedding", "birthday"], link: "https://www.daraz.com.np/catalog/?q=dried%20fruit%20nut%20hamper" },
  { id: 130, name: "Brass Singing Bowl", description: "Meditation bowl with calming tones and a timeless local feel.", emoji: "🛕", price: 2200, priceLabel: "Rs. 2,200", category: "Lifestyle", badge: "Traditional", tags: ["nature", "art", "traditional", "sentimental"], recipients: ["mom", "dad", "grandparent", "partner"], occasions: ["festival", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=brass%20singing%20bowl" },
  { id: 131, name: "Couple Spa Voucher", description: "A relaxed shared experience for anniversaries and romantic surprises.", emoji: "💆", price: 6500, priceLabel: "Rs. 6,500", category: "Experience", badge: "Anniversary", tags: ["romantic", "wellness", "sentimental", "luxury"], recipients: ["partner"], occasions: ["anniversary", "valentine"], link: "https://www.daraz.com.np/catalog/?q=spa%20voucher%20couple" },
  { id: 132, name: "Engraved Wooden Photo Frame", description: "A personal frame for wedding portraits, family photos, or milestone memories.", emoji: "🖼️", price: 1500, priceLabel: "Rs. 1,500", category: "Home", badge: "Personal", tags: ["sentimental", "personalized", "handmade", "art"], recipients: ["friend", "sibling", "partner", "mom", "dad", "grandparent"], occasions: ["wedding", "anniversary", "birthday"], link: "https://www.daraz.com.np/catalog/?q=engraved%20wooden%20photo%20frame" },
  { id: 133, name: "Ceramic Dinner Set", description: "A practical home upgrade that makes sense for newlyweds and new homes.", emoji: "🍽️", price: 5200, priceLabel: "Rs. 5,200", category: "Kitchen", badge: "Wedding useful", tags: ["practical", "home", "cooking", "traditional"], recipients: ["friend", "sibling", "colleague"], occasions: ["wedding"], link: "https://www.daraz.com.np/catalog/?q=ceramic%20dinner%20set" },
  { id: 134, name: "Electric Rice Cooker", description: "A dependable kitchen gift for couples setting up a home.", emoji: "🍚", price: 4300, priceLabel: "Rs. 4,300", category: "Kitchen", badge: "Home starter", tags: ["practical", "cooking", "home"], recipients: ["friend", "sibling", "colleague"], occasions: ["wedding", "graduation"], link: "https://www.daraz.com.np/catalog/?q=electric%20rice%20cooker" },
  { id: 135, name: "Premium Baby Diaper Bag", description: "Organized storage for bottles, clothes, wipes, and daily baby essentials.", emoji: "🍼", price: 2900, priceLabel: "Rs. 2,900", category: "Baby", badge: "Parent favorite", tags: ["baby", "practical", "travel"], recipients: ["partner", "friend", "sibling", "colleague"], occasions: ["babyshower"], link: "https://www.daraz.com.np/catalog/?q=baby%20diaper%20bag" },
  { id: 136, name: "Baby Bath and Grooming Kit", description: "Gentle bath, grooming, and care items for a newborn-ready home.", emoji: "🛁", price: 2200, priceLabel: "Rs. 2,200", category: "Baby", badge: "Baby shower", tags: ["baby", "skincare", "practical"], recipients: ["child", "partner", "friend", "sibling", "mom"], occasions: ["babyshower"], link: "https://www.daraz.com.np/catalog/?q=baby%20bath%20grooming%20kit" },
  { id: 137, name: "Academic Planner and Pen Set", description: "A polished planner set for students starting college or a new role.", emoji: "🗓️", price: 1350, priceLabel: "Rs. 1,350", category: "Stationery", badge: "Graduation", tags: ["books", "practical", "intellectual", "study"], recipients: ["friend", "sibling", "child", "colleague"], occasions: ["graduation"], link: "https://www.daraz.com.np/catalog/?q=academic%20planner%20pen%20set" },
  { id: 138, name: "Laptop Backpack with Rain Cover", description: "A practical daily bag for students, office starters, and commuters.", emoji: "🎒", price: 3600, priceLabel: "Rs. 3,600", category: "Travel", badge: "Career starter", tags: ["travel", "practical", "tech", "adventurous"], recipients: ["friend", "sibling", "child", "colleague", "partner"], occasions: ["graduation", "birthday"], link: "https://www.daraz.com.np/catalog/?q=laptop%20backpack%20rain%20cover" },
  { id: 139, name: "Desk Lamp with Wireless Charger", description: "A cleaner study or work desk setup with light and charging in one.", emoji: "💡", price: 3100, priceLabel: "Rs. 3,100", category: "Tech", badge: "Study setup", tags: ["tech", "practical", "books", "intellectual"], recipients: ["friend", "sibling", "child", "colleague"], occasions: ["graduation", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=desk%20lamp%20wireless%20charger" },
  { id: 140, name: "Festival Dry Fruit Gift Tray", description: "A graceful family-safe tray for Dashain, Tihar, and seasonal visits.", emoji: "🪔", price: 3200, priceLabel: "Rs. 3,200", category: "Food", badge: "Festival", tags: ["traditional", "food", "practical", "family"], recipients: ["mom", "dad", "grandparent", "friend", "colleague"], occasions: ["festival"], link: "https://www.daraz.com.np/catalog/?q=festival%20dry%20fruit%20gift%20tray" },
  { id: 141, name: "Copper Water Bottle Set", description: "A traditional yet useful wellness gift for family and colleagues.", emoji: "🏺", price: 2400, priceLabel: "Rs. 2,400", category: "Lifestyle", badge: "Traditional", tags: ["traditional", "wellness", "practical", "nature"], recipients: ["mom", "dad", "grandparent", "colleague", "friend"], occasions: ["festival", "birthday", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=copper%20water%20bottle%20set" },
  { id: 142, name: "Scented Candle Gift Box", description: "Warm, simple, and elegant for friends, partners, and cozy-home people.", emoji: "🕯️", price: 1700, priceLabel: "Rs. 1,700", category: "Home", badge: "Cozy", tags: ["romantic", "home", "sentimental", "artistic"], recipients: ["partner", "friend", "sibling", "mom"], occasions: ["birthday", "anniversary", "valentine", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=scented%20candle%20gift%20box" },
  { id: 143, name: "Custom Name Bracelet", description: "A small personalized accessory that works well for romantic gifting.", emoji: "📿", price: 1300, priceLabel: "Rs. 1,300", category: "Fashion", badge: "Personalized", tags: ["romantic", "personalized", "fashion", "sentimental"], recipients: ["partner", "friend", "sibling"], occasions: ["valentine", "anniversary", "birthday"], link: "https://www.daraz.com.np/catalog/?q=custom%20name%20bracelet" },
  { id: 144, name: "Polaroid-Style Photo Album", description: "A memory-first gift for travel photos, college memories, and couples.", emoji: "📔", price: 1600, priceLabel: "Rs. 1,600", category: "Photography", badge: "Memory keeper", tags: ["photography", "sentimental", "art", "romantic"], recipients: ["partner", "friend", "sibling"], occasions: ["birthday", "anniversary", "valentine", "graduation"], link: "https://www.daraz.com.np/catalog/?q=polaroid%20photo%20album" },
  { id: 145, name: "Board Game Night Set", description: "A social, low-pressure gift for playful friends and siblings.", emoji: "🎲", price: 2100, priceLabel: "Rs. 2,100", category: "Games", badge: "Fun pick", tags: ["funny", "playful", "gaming", "social"], recipients: ["friend", "sibling", "partner", "colleague"], occasions: ["birthday", "justbecause", "graduation"], link: "https://www.daraz.com.np/catalog/?q=board%20game%20set" },
  { id: 146, name: "Premium Fountain Pen", description: "A refined gift for writers, graduates, mentors, and office professionals.", emoji: "🖋️", price: 2800, priceLabel: "Rs. 2,800", category: "Stationery", badge: "Classic", tags: ["books", "intellectual", "practical", "premium"], recipients: ["dad", "mom", "colleague", "friend", "sibling"], occasions: ["graduation", "birthday", "festival"], link: "https://www.daraz.com.np/catalog/?q=premium%20fountain%20pen" },
  { id: 147, name: "Compact Travel Organizer", description: "Keeps chargers, passport, toiletries, and small essentials sorted.", emoji: "🧳", price: 950, priceLabel: "Rs. 950", category: "Travel", badge: "Budget useful", tags: ["travel", "practical", "adventurous"], recipients: ["friend", "sibling", "partner", "colleague"], occasions: ["birthday", "graduation", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=travel%20organizer%20pouch" },
  { id: 148, name: "Gourmet Cookie Tin", description: "An easy, polished gift for colleagues, friends, and family visits.", emoji: "🍪", price: 1200, priceLabel: "Rs. 1,200", category: "Food", badge: "Easy win", tags: ["food", "practical", "traditional"], recipients: ["friend", "colleague", "mom", "dad", "grandparent"], occasions: ["birthday", "festival", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=gourmet%20cookie%20tin" },
  { id: 149, name: "Silk Sleep Mask and Pillow Spray", description: "A soft self-care bundle for rest, travel, and cozy evenings.", emoji: "😴", price: 1900, priceLabel: "Rs. 1,900", category: "Wellness", badge: "Self-care", tags: ["wellness", "romantic", "travel", "sentimental"], recipients: ["partner", "friend", "sibling", "mom"], occasions: ["birthday", "anniversary", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=silk%20sleep%20mask%20pillow%20spray" },
  { id: 150, name: "Mini Projector", description: "Turns a room into a movie-night setup for couples, friends, and families.", emoji: "📽️", price: 11500, priceLabel: "Rs. 11,500", category: "Tech", badge: "Premium", tags: ["tech", "romantic", "music", "funny", "premium"], recipients: ["partner", "friend", "sibling"], occasions: ["birthday", "anniversary", "valentine", "justbecause"], link: "https://www.daraz.com.np/catalog/?q=mini%20projector" }
];

/* ─── APP STATE ──────────────────────────── */
const USER_SCOPED_KEYS = {
  favorites: 'incanto_favorites',
  recentlyViewed: 'incanto_recent',
  cart: 'incanto_cart',
  orders: 'incanto_orders',
};

const legacyStorageKeys = Object.values(USER_SCOPED_KEYS);

function getActiveUserId() {
  return window.IncantoAuth?.getUser()?.id || null;
}

function getScopedStorageKey(key) {
  const userId = getActiveUserId();
  return userId ? `${USER_SCOPED_KEYS[key]}_${userId}` : null;
}

function getScopedPendingCheckoutKey() {
  const userId = getActiveUserId();
  return userId ? `${PENDING_CHECKOUT_KEY_PREFIX}_${userId}` : null;
}

function readScopedArray(key) {
  const storageKey = getScopedStorageKey(key);
  if (!storageKey) return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (_err) {
    return [];
  }
}

function writeScopedArray(key, value) {
  const storageKey = getScopedStorageKey(key);
  if (!storageKey) return;
  localStorage.setItem(storageKey, JSON.stringify(Array.isArray(value) ? value : []));
}

function clearLegacySharedStorage() {
  legacyStorageKeys.forEach((key) => localStorage.removeItem(key));
  sessionStorage.removeItem(PENDING_CHECKOUT_KEY_PREFIX);
}

function updateStoredUser(user) {
  state.user = user;
  localStorage.setItem('incanto_user', JSON.stringify(user));
}

const state = {
  currentStep: 1,
  totalSteps: 5,
  inputs: { occasion: null, recipient: null, minBudget: 500, budget: 2500, interests: [], personality: null },
  favorites: readScopedArray('favorites'),
  recentlyViewed: readScopedArray('recentlyViewed'),
  cart: readScopedArray('cart'),
  orders: readScopedArray('orders'),
  currentResults: [],
  isFindingGifts: false,
  isProcessingPayment: false,
  useAI: true,
  pendingPurchaseGift: null,
  pendingCheckoutItems: [],
  voucher: { code: '', amount: 0, message: 'Try INCANTO10 for 10% off.' },
  isAuthenticated: window.IncantoAuth?.isAuthenticated() || false,
  user: window.IncantoAuth?.getUser() || null
};

const recipientOptionsByOccasion = {
  birthday: ["partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"],
  anniversary: ["partner", "mom", "dad", "grandparent"],
  wedding: ["friend", "sibling", "colleague"],
  festival: ["partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"],
  graduation: ["partner", "friend", "sibling", "colleague", "child"],
  babyshower: ["partner", "friend", "sibling", "colleague", "mom", "child"],
  valentine: ["partner"],
  justbecause: ["partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"]
};

const allRecipientOptions = [
  "partner", "friend", "mom", "dad", "sibling", "colleague", "child", "grandparent"
];

const recipientHintsByOccasion = {
  birthday: "Birthday gifts can fit almost anyone.",
  anniversary: "Anniversary gifts usually go to your partner, parents, or grandparents.",
  wedding: "Wedding gifts are usually for a friend, sibling, or colleague.",
  festival: "Festival gifts are great for family, friends, partners, and children.",
  graduation: "Graduation gifts usually fit partners, friends, siblings, classmates, colleagues, or children.",
  babyshower: "Baby shower gifts are usually for the new parent or the baby.",
  valentine: "Valentine's gifts are best matched to a partner.",
  justbecause: "Just-because gifts can be for anyone you want to surprise.",
};

function updateRecipientOptions(occasion) {
  const allowed = recipientOptionsByOccasion[occasion] || allRecipientOptions;
  const hint = $('#step-2 .step-hint');
  if (hint) hint.textContent = recipientHintsByOccasion[occasion] || 'Tell us about your recipient';
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

function parsePriceLabel(priceLabel) {
  if (!priceLabel) return null;
  const cleaned = String(priceLabel).replace(/[^0-9]+/g, '');
  return cleaned ? Number(cleaned) : null;
}

function getBudgetRange() {
  const minBudget = Math.max(0, Number(state.inputs.minBudget) || 0);
  const maxBudget = Math.max(minBudget, Number(state.inputs.budget) || minBudget);
  return { minBudget, maxBudget };
}

function isWithinBudgetRange(price) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) return false;
  const { minBudget, maxBudget } = getBudgetRange();
  return numericPrice >= minBudget && numericPrice <= maxBudget;
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = window.IncantoAuth?.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function requireLoginForAction(action = 'continue') {
  if (state.isAuthenticated) return true;
  const messages = {
    cart: 'Please log in to add gifts to your cart. Your cart stays private to your account.',
    buy: 'Please log in before buying. Purchases are saved only to your account.',
    checkout: 'Please log in before checkout. Your cart and purchases stay private to your account.',
  };
  showAuthModal('login', messages[action] || 'Please log in to continue.');
  showToast(messages[action] || 'Please log in to continue.');
  return false;
}

function rememberPendingCheckout() {
  if (!state.pendingPurchaseGift) return;
  const storageKey = getScopedPendingCheckoutKey();
  if (!storageKey) return;
  sessionStorage.setItem(storageKey, JSON.stringify({
    gift: state.pendingPurchaseGift,
    items: state.pendingCheckoutItems,
    voucher: state.voucher,
  }));
}

function restorePendingCheckout() {
  const storageKey = getScopedPendingCheckoutKey();
  if (!storageKey) return false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (!saved?.gift) return false;
    state.pendingPurchaseGift = saved.gift;
    state.pendingCheckoutItems = Array.isArray(saved.items) ? saved.items : [normalizeGiftForStorage(saved.gift)];
    state.voucher = saved.voucher || { code: '', amount: 0, message: 'Try INCANTO10 for 10% off.' };
    return true;
  } catch (_err) {
    return false;
  }
}

function clearPendingCheckout() {
  const storageKey = getScopedPendingCheckoutKey();
  if (storageKey) sessionStorage.removeItem(storageKey);
}

/* ─── GENERATE RESULTS ───────────────────── */
async function generateResults() {
  if (state.isFindingGifts) return;
  state.isFindingGifts = true;
  const overlay = $('#loadingOverlay');
  const findBtn = $('#findGifts');
  const originalFindText = findBtn?.textContent;
  if (findBtn) {
    findBtn.disabled = true;
    findBtn.textContent = 'Finding gifts...';
  }
  overlay?.classList.add('active');

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
    if (loaderText) loaderText.textContent = messages[msgIndex];
  }, 900);

  const done = () => {
    clearInterval(msgInterval);
    overlay?.classList.remove('active');
    if (findBtn) {
      findBtn.disabled = false;
      findBtn.textContent = originalFindText || 'Find Perfect Gifts';
    }
    state.isFindingGifts = false;
  };

  // Map local recipient names to backend-accepted values
  const recipientMap = {
    partner: 'partner', friend: 'friend', mom: 'mom', dad: 'dad',
    sibling: 'sibling', colleague: 'colleague', child: 'child', grandparent: 'grandparent'
  };

  const recipient = recipientMap[state.inputs.recipient] || null;
  const getBudgetFallbackGifts = (limit = 6) => {
    const { minBudget, maxBudget } = getBudgetRange();
    const normalize = (value) => String(value || '').toLowerCase().trim();
    const selectedRecipient = normalize(state.inputs.recipient);
    const selectedOccasion = normalize(state.inputs.occasion);
    const selectedInterests = state.inputs.interests.map(normalize).filter(Boolean);
    const selectedPersonality = normalize(state.inputs.personality);
    const personalityTags = {
      funny: ['funny', 'playful', 'gaming', 'trendy'],
      romantic: ['romantic', 'sentimental', 'fashion', 'photography'],
      practical: ['practical', 'tech', 'fitness', 'cooking'],
      adventurous: ['adventurous', 'travel', 'fitness', 'nature'],
      artistic: ['artistic', 'art', 'photography', 'fashion'],
      intellectual: ['intellectual', 'books', 'tech', 'stationery'],
    };

    const scoredGifts = REAL_WORLD_GIFT_DATABASE
      .filter(gift => isWithinBudgetRange(gift.price))
      .map((gift) => {
        const giftTags = (gift.tags || []).map(normalize);
        const giftRecipients = (gift.recipients || []).map(normalize);
        const giftOccasions = (gift.occasions || []).map(normalize);
        let score = 0;
        const reasons = [];

        if (selectedRecipient && giftRecipients.includes(selectedRecipient)) {
          score += 35;
          reasons.push(`fits ${selectedRecipient}`);
        }

        if (selectedOccasion && giftOccasions.includes(selectedOccasion)) {
          score += 25;
          reasons.push(`works for ${selectedOccasion}`);
        }

        const matchedInterests = selectedInterests.filter((interest) =>
          giftTags.includes(interest) || normalize(gift.category) === interest
        );
        if (matchedInterests.length > 0) {
          score += matchedInterests.length * 30;
          reasons.push(`matches ${matchedInterests.join(', ')}`);
        }

        const personalityMatches = selectedPersonality
          ? (personalityTags[selectedPersonality] || [selectedPersonality])
              .filter(tag => giftTags.includes(tag))
          : [];
        if (personalityMatches.length > 0) {
          score += personalityMatches.length * 18;
          reasons.push(`${selectedPersonality} personality`);
        }

        const remainingBudget = maxBudget - Number(gift.price);
        if (remainingBudget <= 500) score += 10;
        else if (remainingBudget <= 1500) score += 6;

        return {
          ...gift,
          score,
          badge: gift.badge || 'Prototype Pick',
          reason: reasons.length
            ? `Selected because it ${reasons.join(', ')} and stays within Rs. ${minBudget.toLocaleString('en-IN')} to Rs. ${maxBudget.toLocaleString('en-IN')}.`
            : `Closest real-world prototype pick within Rs. ${minBudget.toLocaleString('en-IN')} to Rs. ${maxBudget.toLocaleString('en-IN')}.`,
        };
      })
      .sort((a, b) => b.score - a.score || b.price - a.price || a.name.localeCompare(b.name));

    const preferredGifts = scoredGifts.filter(gift => gift.score > 0);
    const withinBudget = (preferredGifts.length ? preferredGifts : scoredGifts)
      .slice(0, limit)
      .map(({ score, ...gift }) => ({
        ...gift,
        badge: gift.badge || 'Prototype Pick',
      }));

    if (withinBudget.length > 0) return withinBudget.slice(0, limit);

    const fallbackPrice = Math.max(minBudget, Math.min(maxBudget || 500, minBudget || 500));
    return [{
      id: `prototype-${fallbackPrice}`,
      name: 'Thoughtful Budget Gift Box',
      description: 'A simple curated gift idea shown for prototype testing.',
      emoji: '🎁',
      price: fallbackPrice,
      priceLabel: `Rs. ${fallbackPrice.toLocaleString('en-IN')}`,
      badge: 'Prototype Pick',
      reason: `Shown to keep the prototype populated while staying within Rs. ${minBudget.toLocaleString('en-IN')} to Rs. ${maxBudget.toLocaleString('en-IN')}.`,
      tags: ['prototype', selectedPersonality, ...selectedInterests].filter(Boolean),
      recipients: [selectedRecipient || 'friend'],
      occasions: [selectedOccasion || 'justbecause'],
      link: '#',
    }];
  };

  try {
    // Fetch recommendations
    const params = new URLSearchParams();
    if (recipient) params.set('recipient', recipient);
    if (state.inputs.minBudget) params.set('minBudget', state.inputs.minBudget);
    if (state.inputs.budget) params.set('budget', state.inputs.budget);
    if (state.inputs.interests.length) params.set('interests', state.inputs.interests.join(','));
    if (state.inputs.personality) params.set('personality', state.inputs.personality);
    if (state.inputs.occasion) params.set('occasion', state.inputs.occasion);
    params.set('preferOnline', 'true');
    params.set('useAI', state.useAI ? 'true' : 'false');
    params.set('limit', '9');

    const { ok, data } = await apiFetch(`/gifts/recommendations?${params}`);

    done();

    const apiResults = data?.data?.results || [];

    if (ok && data.success) {
      const gifts = apiResults.map(g => ({
        id: g.id,
        name: g.item_name || g.name,
        description: g.description,
        imageUrl: g.image_url || g.imageUrl || null,
        emoji: '🎁',
        price: g.price_npr || g.price,
        priceLabel: (g.price_npr || g.price) ? `Rs. ${Number(g.price_npr || g.price).toLocaleString('en-IN')}` : 'Price unavailable',
        category: g.category || 'Gift',
        badge: g.availability || g.price_range || null,
        reason: g.aiReason || g.reason || `${g.category || 'Gift'} · Rs. ${Number(g.price_npr || g.price).toLocaleString('en-IN')}`,
        link: g.daraz_search_link || g.link || '#',
        recipients: g.recipient || g.recipients || [],
        occasions: g.occasion || g.occasions || [],
        tags: g.tags || [],
        availability: g.availability || 'Available',
        priceRange: g.price_range,
        isLocalNepaliGift: Boolean(g.is_local_nepali_gift)
      })).filter(gift => isWithinBudgetRange(gift.price));
      const presentationGifts = getBudgetFallbackGifts(9);
      const seenGiftKeys = new Set();
      const displayGifts = [...gifts, ...presentationGifts]
        .filter((gift) => {
          const key = String(gift.id || gift.name).toLowerCase();
          if (seenGiftKeys.has(key)) return false;
          seenGiftKeys.add(key);
          return true;
        })
        .slice(0, 9);
      state.currentResults = displayGifts;
      displayResults(displayGifts);

      if (displayGifts.length > 0) {
        showToast(`Found ${displayGifts.length} presentation-ready gift ideas!`);
      } else {
        showToast('Showing prototype picks within your budget.');
      }
      done();
      return;
    }

    throw new Error(data.message || 'No results from API');

  } catch (err) {
    done();
    console.warn('API recommendations failed:', err.message);
    const fallbackGifts = getBudgetFallbackGifts();
    state.currentResults = fallbackGifts;
    displayResults(fallbackGifts);
    showToast('Showing prototype picks within your budget.');
  }
}

window.IncantoFindGifts = (event) => {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  generateResults().catch((err) => {
    console.error('Gift finder failed:', err);
    showToast('Something went wrong while finding gifts. Please try again.');
  });
  return false;
};

document.addEventListener('click', (event) => {
  const btn = event.target.closest?.('#findGifts');
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();
  window.IncantoFindGifts(event);
}, true);

/* ─── DISPLAY ────────────────────────────── */
function displayResults(gifts) {
  const section = $('#results');
  const grid = $('#recommendationsGrid');
  const title = $('#resultsTitle');
  if (!section || !grid || !title) return;

  const recipientNames = {
    partner: 'your partner', friend: 'your friend', mom: 'mom',
    dad: 'dad', sibling: 'your sibling', colleague: 'your colleague',
    child: 'the little one', grandparent: 'grandma or grandpa'
  };

  if (state.inputs.recipient && recipientNames[state.inputs.recipient]) {
    title.textContent = `Perfect gifts for ${recipientNames[state.inputs.recipient]} ✨`;
  }

  grid.innerHTML = '';
  if (!Array.isArray(gifts) || gifts.length === 0) {
    grid.innerHTML = '<div class="results-empty">No gifts found inside this exact price range. Try widening your minimum or maximum budget.</div>';
  }

  gifts.forEach((gift, idx) => {
    const card = createGiftCard(gift, idx);
    grid.appendChild(card);
  });

  section.style.display = 'block';
  requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
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
  const fallbackImage = '/images/fallback-gift.jpg';
  const safeName = escapeHtml(gift.name || 'Gift item');
  const safeDescription = escapeHtml(gift.description || 'A thoughtful recommendation based on your choices.');
  const safeReason = escapeHtml(gift.reason || 'It matches the preferences you selected.');
  const safePriceLabel = escapeHtml(gift.priceLabel || 'Price unavailable');
  const safeBadge = escapeHtml(gift.availability || gift.badge || 'Available');
  const safeLink = escapeHtml(gift.link || '#');
  const safeCategory = escapeHtml(gift.category || 'Gift');
  const safeRecipients = escapeHtml((gift.recipients || gift.recipient || []).join(', ') || 'Anyone');
  const safeOccasions = escapeHtml((gift.occasions || gift.occasion || []).join(', ') || 'Any occasion');
  const safeTagsHtml = (gift.tags || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  const imageSrc = escapeHtml(gift.imageUrl || fallbackImage);
  const safeEmoji = escapeHtml(gift.emoji || '🎁');

  div.innerHTML = `
    <div class="gift-img-wrap">
      <img src="${imageSrc}" alt="${safeName}" class="gift-image" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage}';" />
      <span class="gift-emoji-fallback" aria-hidden="true">${safeEmoji}</span>
      <div class="gift-badge">${safeBadge}</div>
      <button class="fav-btn ${isFaved ? 'saved' : ''}" data-id="${gift.id}" title="Save to favorites">
        ${isFaved ? '❤️' : '🤍'}
      </button>
    </div>
    <div class="gift-body">
      <h3 class="gift-name">${safeName}</h3>
      <div class="gift-meta">
        <span>${safeCategory}</span>
        <span>${safeRecipients}</span>
        <span>${safeOccasions}</span>
      </div>
      <p class="gift-desc">${safeDescription}</p>
      ${safeTagsHtml ? `<div class="gift-tags">${safeTagsHtml}</div>` : ''}
      <div class="gift-ai-reason"><strong>✦ Why it's perfect</strong> ${safeReason}</div>
      <div class="gift-footer">
        <div class="gift-price">${safePriceLabel} <span>onwards</span></div>
        <button class="btn-cart" type="button" data-gift-id="${gift.id}">Add to Cart</button>
        <a href="#" class="btn-buy" data-gift-id="${gift.id}" data-link="${safeLink}">Search on Daraz</a>
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
  if (!requireLoginForAction('buy')) return;
  state.pendingPurchaseGift = gift;
  state.pendingCheckoutItems = [normalizeGiftForStorage(gift)];
  const emoji = $('#purchaseGiftEmoji');
  const name = $('#purchaseGiftName');
  const price = $('#purchaseGiftPrice');
  const reason = $('#purchaseGiftReason');
  const details = $('#purchaseGiftDetails');

  if (emoji) emoji.textContent = gift.emoji || '🎁';
  if (name) name.textContent = gift.name;
  if (price) price.textContent = gift.priceLabel || 'Price unavailable';
  if (reason) reason.textContent = gift.reason || 'This gift matches the preferences you selected.';
  if (details) details.textContent = `Confirm ${gift.name} and continue to the INCANTO payment page.`;

  showToast(`Great choice. Review "${gift.name}" before payment.`);
  window.location.hash = '#purchase';
  handleRouting();
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
}

function showCartPurchaseConfirmation() {
  if (!requireLoginForAction('checkout')) return;
  if (state.cart.length === 0) {
    showToast('Your cart is empty.');
    return;
  }
  const validItems = state.cart.map(normalizeGiftForStorage).filter(item => Number.isFinite(Number(item.price)));
  if (validItems.length === 0) {
    showToast('Your cart items are missing valid prices.');
    return;
  }
  const total = getCartTotal();
  const gift = {
    id: `cart-${Date.now()}`,
    name: `${state.cart.length} cart item${state.cart.length === 1 ? '' : 's'}`,
    emoji: '🛒',
    priceLabel: total ? `Rs. ${total.toLocaleString('en-IN')}` : 'Cart total',
    reason: 'Checkout all selected cart items together.',
    link: '#',
  };
  state.pendingPurchaseGift = gift;
  state.pendingCheckoutItems = validItems;
  const emoji = $('#purchaseGiftEmoji');
  const name = $('#purchaseGiftName');
  const price = $('#purchaseGiftPrice');
  const reason = $('#purchaseGiftReason');
  const details = $('#purchaseGiftDetails');

  if (emoji) emoji.textContent = gift.emoji;
  if (name) name.textContent = gift.name;
  if (price) price.textContent = gift.priceLabel;
  if (reason) reason.textContent = gift.reason;
  if (details) details.textContent = 'Confirm your cart and continue to the INCANTO payment page.';
  showToast(`Checkout started for ${validItems.length} private cart item${validItems.length === 1 ? '' : 's'}.`);
  window.location.hash = '#purchase';
  handleRouting();
}

function showSingleCartItemPurchase(item) {
  const gift = normalizeGiftForStorage(item);
  if (!Number.isFinite(Number(gift.price))) {
    showToast('This cart item is missing a valid price.');
    return;
  }
  state.pendingPurchaseGift = gift;
  state.pendingCheckoutItems = [gift];
  showPurchaseConfirmation(gift);
}

async function confirmPurchase() {
  if (!requireLoginForAction('buy')) return;
  const gift = state.pendingPurchaseGift;
  if (!gift) {
    showToast('Choose an item from your cart before checkout.');
    window.location.hash = '#cart';
    return;
  }
  showFinalPurchasePage(gift);
}

function showFinalPurchasePage(gift) {
  if (!requireLoginForAction('buy')) return;
  state.pendingPurchaseGift = gift;
  const isCartCheckout = String(gift.id).startsWith('cart-');
  if (!isCartCheckout) {
    state.pendingCheckoutItems = [normalizeGiftForStorage(gift)];
  }
  if (isCartCheckout && state.pendingCheckoutItems.length === 0) {
    state.pendingCheckoutItems = state.cart.map(normalizeGiftForStorage);
  }

  const total = getPendingTotal();
  const finalEmoji = $('#finalPurchaseGiftEmoji');
  const finalName = $('#finalPurchaseGiftName');
  const finalReason = $('#finalPurchaseGiftReason');
  const finalPrice = $('#finalPurchaseGiftPrice');
  const finalDetails = $('#finalPurchaseGiftDetails');

  if (finalEmoji) finalEmoji.textContent = gift.emoji || '🎁';
  if (finalName) finalName.textContent = gift.name || 'Gift item';
  if (finalReason) finalReason.textContent = gift.reason || 'Ready for checkout.';
  if (finalPrice) finalPrice.textContent = total ? `Rs. ${total.toLocaleString('en-IN')}` : (gift.priceLabel || 'Price unavailable');
  if (finalDetails) {
    finalDetails.textContent = isCartCheckout
      ? `You are confirming ${state.pendingCheckoutItems.length} cart item${state.pendingCheckoutItems.length === 1 ? '' : 's'} before payment.`
      : `You are confirming "${gift.name}" before payment.`;
  }

  showToast('Almost there. Confirm once more to open payment.');
  window.location.hash = '#purchase-final';
  handleRouting();
}

function continueToPayment() {
  if (!requireLoginForAction('buy')) return;
  const gift = state.pendingPurchaseGift;
  if (!gift) {
    showToast('Choose a gift before payment.');
    window.location.hash = '#home';
    return;
  }
  rememberPendingCheckout();
  showToast('Opening your secure demo payment page.');
  showPaymentPage(gift);
}

const DEMO_VOUCHERS = {
  INCANTO10: { discount: 0.10, label: '10% off' },
  GIFT50: { discount: 0.50, maxAmount: 2500, label: '50% off up to Rs. 2,500' },
};

function getPendingTotal() {
  return state.pendingCheckoutItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
}

function updatePaymentTotal() {
  const raw = getPendingTotal();
  const discount = state.voucher.amount || 0;
  const total = Math.max(0, raw - discount);
  const paymentTotal = $('#paymentTotal');
  const voucherMessage = $('#voucherMessage');
  if (paymentTotal) paymentTotal.textContent = `Rs. ${total.toLocaleString('en-IN')}`;
  if (voucherMessage) voucherMessage.textContent = state.voucher.message || 'Try INCANTO10 for 10% off.';
}

function applyVoucher(code) {
  const normalized = String(code || '').trim().toUpperCase();
  const raw = getPendingTotal();
  if (!normalized) {
    state.voucher = { code: '', amount: 0, message: 'No voucher applied.' };
    updatePaymentTotal();
    showToast('No voucher applied.');
    return state.voucher;
  }

  const promo = DEMO_VOUCHERS[normalized];
  if (!promo) {
    state.voucher = { code: normalized, amount: 0, message: 'Invalid voucher. Try INCANTO10 or GIFT50.' };
    showToast('That voucher was not accepted. Try INCANTO10 or GIFT50.');
  } else {
    const amount = promo.maxAmount ? Math.min(raw * promo.discount, promo.maxAmount) : raw * promo.discount;
    state.voucher = {
      code: normalized,
      amount: Math.round(amount),
      message: `Voucher applied: ${promo.label} (-Rs. ${Math.round(amount).toLocaleString('en-IN')})`,
    };
    showToast(`Voucher ${normalized} applied. You saved Rs. ${Math.round(amount).toLocaleString('en-IN')}.`);
  }

  updatePaymentTotal();
  return state.voucher;
}

function showPaymentPage(gift) {
  if (!requireLoginForAction('buy')) return;
  state.pendingPurchaseGift = gift;
  const isCartCheckout = String(gift.id).startsWith('cart-');
  if (!isCartCheckout) {
    state.pendingCheckoutItems = [normalizeGiftForStorage(gift)];
  }
  if (isCartCheckout && state.pendingCheckoutItems.length === 0) {
    state.pendingCheckoutItems = state.cart.map(normalizeGiftForStorage);
  }
  state.voucher = { code: '', amount: 0, message: 'Try INCANTO10 for 10% off.' };
  rememberPendingCheckout();
  if (!IS_PAYMENT_PAGE) {
    window.location.href = 'payment.html';
    return;
  }
  showToast('Payment form ready. Your checkout is private to this account.');
  updatePaymentProcess('Ready for secure demo payment.', false);
  if ($('#voucherCode')) $('#voucherCode').value = '';
  $('#paymentGiftEmoji').textContent = gift.emoji || '🎁';
  if ($('#paymentGiftName')) $('#paymentGiftName').textContent = gift.name || 'Gift item';
  if ($('#paymentGiftReason')) $('#paymentGiftReason').textContent = gift.reason || 'Ready for checkout.';
  if ($('#paymentGiftPrice')) $('#paymentGiftPrice').textContent = gift.priceLabel || 'Price unavailable';
  updatePaymentTotal();
}

function hydrateCheckoutPage() {
  if (IS_PAYMENT_PAGE && !state.isAuthenticated) {
    showToast('Please log in before payment.');
    window.location.href = 'index.html#home';
    return;
  }
  if (!restorePendingCheckout()) {
    if (IS_PAYMENT_PAGE) {
      showToast('Choose a gift before payment.');
      window.location.href = 'index.html#finder';
    }
    return;
  }

  if (IS_PAYMENT_PAGE && state.pendingPurchaseGift) {
    showPaymentPage(state.pendingPurchaseGift);
    return;
  }

  if (window.location.hash === '#purchase-final' && state.pendingPurchaseGift) {
    showFinalPurchasePage(state.pendingPurchaseGift);
  }
}

function getGiftFromCard(card, btn) {
  const rawId = btn.dataset.giftId || card.dataset.id || null;
  const id = rawId ? (Number(rawId) || rawId) : Date.now();
  if (Number(rawId) && state.currentResults.length) {
    const existing = state.currentResults.find(g => Number(g.id) === Number(rawId));
    if (existing) return existing;
  }

  const name = card.querySelector('.gift-name')?.textContent?.trim() || 'Gift item';
  const description = card.querySelector('.gift-desc')?.textContent?.trim() || '';
  const priceLabel = card.querySelector('.gift-price')?.textContent?.trim() || 'Price unavailable';
  const price = Number(card.dataset.price) || parsePriceLabel(priceLabel) || null;
  const emoji = card.querySelector('.gift-img-wrap span')?.textContent?.trim() || card.querySelector('.gift-img-wrap img')?.alt?.trim() || '🎁';
  const reason = card.querySelector('.gift-ai-reason')?.textContent?.trim() || description || '';
  const link = btn.dataset.link || btn.href || '#';

  return { id, name, description, price, priceLabel, emoji, reason, link, quantity: 1 };
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

function initStaticTrendingCards() {
  const cards = document.querySelectorAll('#trendingGrid .gift-card');
  cards.forEach(card => {
    const buyBtn = card.querySelector('.btn-buy');
    const cartBtn = card.querySelector('.btn-cart');
    const favBtn = card.querySelector('.fav-btn');

    if (buyBtn) {
      buyBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const gift = getGiftFromCard(card, buyBtn);
        showPurchaseConfirmation(gift);
      });
    }

    if (cartBtn) {
      cartBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const gift = getGiftFromCard(card, cartBtn);
        addToCart(gift);
      });
    }

    if (favBtn) {
      favBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const gift = getGiftFromCard(card, favBtn);
        toggleFavorite(gift, favBtn);
      });
    }
  });
}

function cancelPurchase() {
  state.pendingPurchaseGift = null;
  state.pendingCheckoutItems = [];
  clearPendingCheckout();
  $('#paymentForm')?.reset();
  setPaymentMethod('card');
  window.location.href = IS_PAYMENT_PAGE ? 'index.html#home' : '#home';
}

function backToPurchase() {
  if (state.pendingPurchaseGift) {
    rememberPendingCheckout();
    if (IS_PAYMENT_PAGE) {
      window.location.href = 'index.html#purchase-final';
      return;
    }
    showPurchaseConfirmation(state.pendingPurchaseGift);
  } else {
    window.location.href = IS_PAYMENT_PAGE ? 'index.html#home' : '#home';
  }
}

async function handlePaymentSubmit(event) {
  event.preventDefault();
  event.stopPropagation();
  if (!requireLoginForAction('buy')) return;
  if (state.isProcessingPayment) return;
  const gift = state.pendingPurchaseGift;
  if (!gift) {
    showToast('Choose a gift before payment.');
    window.location.hash = '#home';
    return;
  }

  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';
  const needsCard = method === 'card';
  const address = $('#deliveryAddress')?.value.trim();
  const voucherCode = $('#voucherCode')?.value.trim();

  if (voucherCode) {
    applyVoucher(voucherCode);
  }

  if (needsCard) {
    const cardName = $('#cardName')?.value.trim();
    const cardNumber = $('#cardNumber')?.value.replace(/\s+/g, '');
    const cardExpiry = $('#cardExpiry')?.value.trim();
    const cardCvc = $('#cardCvc')?.value.trim();
    if (!cardName || cardNumber.length < 12 || !cardExpiry || cardCvc.length < 3) {
      showToast('Please enter complete card details.');
      return;
    }
  }

  if (!address) {
    showToast('Please enter a delivery address.');
    return;
  }

  setPaymentProcessing(true, 'Verifying details...');
  try {
    showToast('Processing your purchase for this account...');
    await wait(450);
    setPaymentProcessing(true, 'Saving order...');
    addToRecentlyViewed(gift, { sync: false });
    const savedOrder = await saveOrder(gift);
    await wait(350);
    const purchasedCount = state.pendingCheckoutItems.length || 1;
    setPaymentProcessing(false);
    showPurchaseSuccessPopup(savedOrder, purchasedCount);
    showToast(`Purchase complete. ${purchasedCount} item${purchasedCount === 1 ? '' : 's'} saved to My Purchases.`);
    state.pendingPurchaseGift = null;
    state.pendingCheckoutItems = [];
    clearPendingCheckout();
    $('#paymentForm')?.reset();
    setPaymentMethod('card');
  } finally {
    if (state.isProcessingPayment) setPaymentProcessing(false);
  }
}

async function saveOrder(gift) {
  const items = state.pendingCheckoutItems.length
    ? state.pendingCheckoutItems
    : [normalizeGiftForStorage(gift)];
  const subTotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
  const discount = state.voucher?.amount || 0;
  const total = Math.max(0, subTotal - discount);
  const order = {
    id: `INC-${Date.now()}`,
    placedAt: new Date().toISOString(),
    status: 'Confirmed',
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card',
    voucher: state.voucher?.code || null,
    discount,
    items,
    total,
    shippingAddress: $('#deliveryAddress')?.value.trim() || '',
  };

  state.orders.unshift(order);
  writeScopedArray('orders', state.orders);

  if (state.isAuthenticated) {
    try {
      const { ok, data } = await apiFetch('/users/orders', {
        method: 'POST',
        body: JSON.stringify({ order }),
      });
      if (ok && data?.data?.order) {
        state.orders[0] = data.data.order;
        writeScopedArray('orders', state.orders);
        updateStoredUser(data.data.user);
        state.cart = Array.isArray(state.user?.cart) ? state.user.cart : state.cart;
      }
    } catch (_err) {
      showToast('Order saved locally for this account. API sync will need the backend online.');
    }
  }

  const orderedIds = new Set(items.map(item => String(item.id)));
  state.cart = state.cart.filter(item => !orderedIds.has(String(item.id)));
  writeScopedArray('cart', state.cart);
  updateCartUI();
  renderOrdersPage();
  return state.orders[0] || order;
}

window.IncantoSubmitPayment = (event) => {
  handlePaymentSubmit(event);
  return false;
};

document.addEventListener('submit', (event) => {
  if (event.target?.id !== 'paymentForm') return;
  event.preventDefault();
  event.stopPropagation();
  window.IncantoSubmitPayment(event);
}, true);

function setPaymentMethod(method) {
  $$('.payment-method').forEach(label => {
    const input = label.querySelector('input');
    const isActive = input?.value === method;
    label.classList.toggle('active', isActive);
    if (input) input.checked = isActive;
  });
  const cardFields = ['#cardName', '#cardNumber', '#cardExpiry', '#cardCvc'];
  cardFields.forEach(selector => {
    const field = $(selector);
    if (field) field.disabled = method !== 'card';
  });
}

function setPaymentProcessing(isProcessing, label = 'Processing...') {
  state.isProcessingPayment = isProcessing;
  updatePaymentProcess(isProcessing ? label : 'Ready for secure demo payment.', isProcessing);
  const submitBtn = $('#paymentSubmitBtn') || $('#paymentForm button[type="submit"]');
  const labelEl = submitBtn?.querySelector('.payment-submit-label');
  if (submitBtn) {
    submitBtn.disabled = isProcessing;
    submitBtn.classList.toggle('is-processing', isProcessing);
  }
  if (labelEl) labelEl.textContent = isProcessing ? label : 'Confirm & Pay';
  else if (submitBtn) submitBtn.textContent = isProcessing ? label : 'Confirm & Pay';
  $$('#paymentForm input, #paymentForm button').forEach((control) => {
    if (control === submitBtn) return;
    control.disabled = isProcessing || control.dataset.paymentDisabled === 'true';
  });
  if (!isProcessing) {
    setPaymentMethod(document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card');
  }
}

function updatePaymentProcess(message, isActive = false) {
  const status = $('#paymentProcessStatus');
  if (!status) return;
  status.classList.toggle('is-active', isActive);
  const text = status.querySelector('p');
  if (text) text.textContent = message;
}

function closePurchaseSuccessPopup() {
  $('#purchaseSuccessModal')?.classList.remove('open');
  $('#purchaseSuccessModal')?.setAttribute('aria-hidden', 'true');
  window.location.href = IS_PAYMENT_PAGE ? 'index.html#orders' : '#orders';
}

function showPurchaseSuccessPopup(order, itemCount) {
  updatePaymentProcess('Order confirmed and saved to your account.', false);
  const modal = $('#purchaseSuccessModal');
  if (!modal) {
    window.location.href = IS_PAYMENT_PAGE ? 'index.html#orders' : '#orders';
    return;
  }

  const orderTotal = Number(order?.total);
  const total = Number.isFinite(orderTotal) ? orderTotal : getPendingTotal();
  const itemLabel = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  if ($('#purchaseSuccessTitle')) $('#purchaseSuccessTitle').textContent = 'Your order is confirmed';
  if ($('#purchaseSuccessMessage')) {
    $('#purchaseSuccessMessage').textContent = `${itemLabel} saved to My Purchases. Your cart was updated for this account.`;
  }
  if ($('#purchaseSuccessOrderId')) $('#purchaseSuccessOrderId').textContent = `Order ${order?.id || 'INC-'}`;
  if ($('#purchaseSuccessTotal')) $('#purchaseSuccessTotal').textContent = `Rs. ${total.toLocaleString('en-IN')}`;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    if (modal.classList.contains('open')) closePurchaseSuccessPopup();
  }, 4200);
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
  writeScopedArray('favorites', state.favorites);
  updateFavoritesUI();
}

function updateFavoritesUI() {
  const bar = $('#favoritesBar');
  const count = $('#favCount');
  if (!bar || !count) return;
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
        <button class="btn-buy modal-buy" type="button" style="font-size:.78rem;padding:8px 14px;">Buy →</button>
      `;
      item.querySelector('.modal-buy')?.addEventListener('click', () => {
        $('#favsModal').classList.remove('open');
        showPurchaseConfirmation({
          id: fav.id,
          name: fav.name,
          emoji: fav.emoji,
          priceLabel: fav.priceLabel,
          reason: 'Saved from your favorite gifts.',
          link: '#',
        });
      });
      body.appendChild(item);
    });
  }
  $('#favsModal').classList.add('open');
}

/* ─── RECENTLY VIEWED ────────────────────── */
function normalizeGiftForStorage(gift) {
  const price = gift.price != null ? Number(gift.price) : parsePriceLabel(gift.priceLabel);
  return {
    id: gift.id,
    name: gift.name,
    description: gift.description || '',
    category: gift.category || 'Gift',
    emoji: gift.emoji || '🎁',
    price: Number.isFinite(price) ? price : null,
    priceLabel: gift.priceLabel || 'Price unavailable',
    quantity: gift.quantity || 1,
    reason: gift.reason || '',
    link: gift.link || '#',
  };
}

async function addToCart(gift) {
  if (!requireLoginForAction('cart')) return;
  const normalizedGift = normalizeGiftForStorage(gift);
  const existing = state.cart.find(item => String(item.id) === String(gift.id));
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.unshift({ ...normalizedGift, quantity: 1, addedAt: new Date().toISOString() });
  }
  writeScopedArray('cart', state.cart);
  updateCartUI();
  showToast(existing
    ? `"${gift.name}" quantity updated in your private cart.`
    : `"${gift.name}" added to your private cart.`);

  try {
    const { ok, data } = await apiFetch('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ gift: normalizedGift }),
    });
    if (ok && data?.data?.user) {
      updateStoredUser(data.data.user);
      state.cart = Array.isArray(state.user.cart) ? state.user.cart : state.cart;
      writeScopedArray('cart', state.cart);
      updateCartUI();
    }
  } catch (_err) {
    showToast('Saved locally for this account. API sync will need the backend online.');
  }
}

async function removeFromCart(giftId) {
  const removedItem = state.cart.find(item => String(item.id) === String(giftId));
  state.cart = state.cart.filter(item => String(item.id) !== String(giftId));
  writeScopedArray('cart', state.cart);
  updateCartUI();
  if (removedItem) showToast(`Removed "${removedItem.name}" from your cart.`);
  if (state.isAuthenticated) {
    try {
      const { ok, data } = await apiFetch(`/users/cart/${encodeURIComponent(giftId)}`, { method: 'DELETE' });
      if (ok && data?.data?.user) {
        updateStoredUser(data.data.user);
        state.cart = Array.isArray(state.user.cart) ? state.user.cart : state.cart;
        writeScopedArray('cart', state.cart);
        updateCartUI();
      }
    } catch (_err) {
      showToast('Removed locally. API sync will need the backend online.');
    }
  }
}

async function changeCartQuantity(giftId, delta) {
  const item = state.cart.find(cartItem => String(cartItem.id) === String(giftId));
  if (!item) return;
  item.quantity = Math.max(1, (item.quantity || 1) + delta);
  writeScopedArray('cart', state.cart);
  updateCartUI();
  showToast(`Quantity for "${item.name}" is now ${item.quantity}.`);
  if (state.isAuthenticated) {
    try {
      const { ok, data } = await apiFetch(`/users/cart/${encodeURIComponent(giftId)}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: item.quantity }),
      });
      if (ok && data?.data?.user) {
        updateStoredUser(data.data.user);
        state.cart = Array.isArray(state.user.cart) ? state.user.cart : state.cart;
        writeScopedArray('cart', state.cart);
        updateCartUI();
      }
    } catch (_err) {
      showToast('Quantity changed locally. API sync will need the backend online.');
    }
  }
}

function updateCartUI() {
  renderCart();
  renderCartPage();
  updateCartBadge();
  updateQuickCartBanner();
}

function updateCartBadge() {
  const badge = $('#navCartCount');
  const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (badge) badge.textContent = totalItems;
  return totalItems;
}

function updateQuickCartBanner() {
  const banner = $('#quickCartBanner');
  const countLabel = $('#quickCartItemsCount');
  const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (!banner || !countLabel) return;
  banner.style.display = totalItems > 0 ? 'flex' : 'none';
  countLabel.textContent = totalItems;
}

function showCartPage() {
  renderCartPage();
  window.location.hash = '#cart';
  handleRouting();
}

function renderCart() {
  const section = $('#cartSection');
  const grid = $('#cartGrid');
  const count = $('#cartCount');
  if (!section || !grid || !count) return;

  const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  count.textContent = totalItems;
  updateCartBadge();

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

function renderCartPage() {
  const list = $('#cartPageList');
  const count = $('#cartPageCount');
  const total = $('#cartPageTotal');
  const checkoutBtn = $('#checkoutCartBtn');
  if (!list || !count || !total || !checkoutBtn) return;

  const totalItems = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartTotal = getCartTotal();
  count.textContent = totalItems;
  total.textContent = cartTotal ? `Rs. ${cartTotal.toLocaleString('en-IN')}` : 'Rs. 0';
  checkoutBtn.disabled = state.cart.length === 0;
  updateCartBadge();

  if (state.cart.length === 0) {
    list.innerHTML = '<div class="shop-empty">Your cart is empty. Add gifts from recommendations or trending items.</div>';
    return;
  }

  list.innerHTML = '';
  state.cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `
      <div class="shop-emoji">${escapeHtml(item.emoji || '🎁')}</div>
      <div class="shop-info">
        <h3>${escapeHtml(item.name || 'Gift item')}</h3>
        <p>${escapeHtml(item.description || item.reason || 'Saved for checkout.')}</p>
        <strong>${escapeHtml(item.priceLabel || 'Price unavailable')}</strong>
      </div>
      <div class="shop-controls">
        <div class="qty-control">
          <button type="button" data-action="decrease">-</button>
          <span>${item.quantity || 1}</span>
          <button type="button" data-action="increase">+</button>
        </div>
        <button class="btn-secondary" type="button" data-action="buy">Buy</button>
        <button class="cart-remove" type="button" data-action="remove">Remove</button>
      </div>
    `;
    row.querySelector('[data-action="decrease"]')?.addEventListener('click', () => changeCartQuantity(item.id, -1));
    row.querySelector('[data-action="increase"]')?.addEventListener('click', () => changeCartQuantity(item.id, 1));
    row.querySelector('[data-action="remove"]')?.addEventListener('click', () => removeFromCart(item.id));
    row.querySelector('[data-action="buy"]')?.addEventListener('click', () => showSingleCartItemPurchase(item));
    list.appendChild(row);
  });
}

function renderOrdersPage() {
  const list = $('#ordersList');
  if (!list) return;

  if (state.orders.length === 0) {
    list.innerHTML = '<div class="shop-empty">No purchases yet. Completed checkouts will appear here.</div>';
    return;
  }

  list.innerHTML = '';
  state.orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const date = new Date(order.placedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const items = order.items || [];
    card.innerHTML = `
      <div class="order-head">
        <div>
          <span>${escapeHtml(order.id)}</span>
          <h3>${items.length} item${items.length === 1 ? '' : 's'} bought</h3>
        </div>
        <strong>${escapeHtml(order.status || 'Confirmed')}</strong>
      </div>
      <div class="order-meta">${escapeHtml(date)} · ${escapeHtml(order.paymentMethod || 'payment')}</div>
      <div class="order-items">
        ${items.map(item => `
          <div class="order-item">
            <span>${escapeHtml(item.emoji || '🎁')}</span>
            <div><strong>${escapeHtml(item.name || 'Gift item')}</strong><small>${escapeHtml(item.priceLabel || 'Price unavailable')} · Qty ${item.quantity || 1}</small></div>
          </div>
        `).join('')}
      </div>
      <div class="shop-total">${order.total ? `Rs. ${Number(order.total).toLocaleString('en-IN')}` : 'Total unavailable'}</div>
    `;
    list.appendChild(card);
  });
}

/* ─── FINDER ─────────────────────────────── */
function addToRecentlyViewed(gift, options = {}) {
  const { sync = true } = options;
  state.recentlyViewed = state.recentlyViewed.filter(item => item.id !== gift.id);
  state.recentlyViewed.unshift({
    ...normalizeGiftForStorage(gift),
    viewedAt: new Date().toISOString(),
  });
  state.recentlyViewed = state.recentlyViewed.slice(0, 6);
  writeScopedArray('recentlyViewed', state.recentlyViewed);
  if (sync && state.isAuthenticated) {
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
    btn.addEventListener('click', function (event) {
      event.preventDefault();
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
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      this.classList.toggle('selected');
      const val = this.dataset.value;
      if (this.classList.contains('selected')) state.inputs.interests.push(val);
      else state.inputs.interests = state.inputs.interests.filter(i => i !== val);
    });
  });

  $$('.pers-btn').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      $$('.pers-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      state.inputs.personality = this.dataset.value;
    });
  });

  $$('.btn-next').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      goToStep(parseInt(this.id.replace('next', '')) + 1);
    });
  });

  $$('.btn-back').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      goToStep(parseInt(this.closest('.finder-step').id.split('-')[1]) - 1);
    });
  });

  $('#findGifts')?.addEventListener('click', window.IncantoFindGifts);

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
  const minVal = $('#minBudgetVal');
  const minInput = $('#minBudgetInput');
  const maxInput = $('#maxBudgetInput');
  const syncBudgetUI = () => {
    const { minBudget, maxBudget } = getBudgetRange();
    state.inputs.minBudget = minBudget;
    state.inputs.budget = maxBudget;
    if (slider) slider.value = maxBudget;
    if (minInput) minInput.value = minBudget;
    if (maxInput) maxInput.value = maxBudget;
    if (minVal) minVal.textContent = minBudget.toLocaleString('en-IN');
    if (val) val.textContent = maxBudget.toLocaleString('en-IN');
    updateSliderBackground(slider);
  };
  slider.addEventListener('input', function () {
    state.inputs.budget = Math.max(parseInt(this.value, 10), Number(state.inputs.minBudget) || 0);
    syncBudgetUI();
  });
  minInput?.addEventListener('input', function () {
    state.inputs.minBudget = Math.max(0, parseInt(this.value, 10) || 0);
    if (state.inputs.minBudget > state.inputs.budget) state.inputs.budget = state.inputs.minBudget;
    syncBudgetUI();
  });
  maxInput?.addEventListener('input', function () {
    state.inputs.budget = Math.max(0, parseInt(this.value, 10) || 0);
    if (state.inputs.budget < state.inputs.minBudget) state.inputs.minBudget = state.inputs.budget;
    syncBudgetUI();
  });
  $$('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      $$('.preset-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const v = parseInt(this.dataset.val);
      const defaultMins = { 1000: 0, 3000: 1000, 7000: 3000, 15000: 7000 };
      const min = this.dataset.min !== undefined ? parseInt(this.dataset.min, 10) : defaultMins[v] || 0;
      slider.value = v;
      state.inputs.minBudget = min;
      state.inputs.budget = v;
      syncBudgetUI();
    });
  });
  syncBudgetUI();
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
    const more = REAL_WORLD_GIFT_DATABASE
      .filter(g => isWithinBudgetRange(g.price) && !currentIds.includes(g.id))
      .slice(0, 3);
    if (more.length > 0) {
      const grid = $('#recommendationsGrid');
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
  state.inputs = { occasion: null, recipient: null, minBudget: 500, budget: 2500, interests: [], personality: null };
  state.currentStep = 1;
  state.currentResults = [];
  $$('.choice-btn, .tag-btn, .pers-btn').forEach(b => b.classList.remove('selected'));
  $$('.btn-next').forEach(b => b.disabled = true);
  $('#next3').disabled = false;
  $('#budgetSlider').value = 2500;
  $('#minBudgetInput').value = 500;
  $('#maxBudgetInput').value = 2500;
  $('#minBudgetVal').textContent = '500';
  $('#budgetVal').textContent = '2,500';
  $$('.preset-btn').forEach(b => b.classList.remove('active'));
  $$('.finder-step').forEach(s => s.classList.remove('active'));
  $('#step-1').classList.add('active');
  $$('.pstep').forEach(s => s.classList.remove('active', 'completed'));
  $('.pstep[data-step="1"]').classList.add('active');
  $('#progressFill').style.width = '0%';
  $('#results').style.display = 'none';
  const recipientHint = $('#step-2 .step-hint');
  if (recipientHint) recipientHint.textContent = 'Tell us about your recipient';
  $('#finder').scrollIntoView({ behavior: 'smooth' });
}

/* ─── NAVBAR ─────────────────────────────── */
function initNavbar() {
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
  const ham = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const setMenuOpen = (isOpen) => {
    mobileMenu.classList.toggle('open', isOpen);
    ham.setAttribute('aria-expanded', String(isOpen));
    ham.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };

  ham.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
  $$('.mobile-link').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
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
let toastTimer = null;

function showToast(message, duration = 2800) {
  const toast = $('#toast');
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), duration);
}

/* ─── ROUTING ────────────────────────────── */
function showAuthModal(mode = 'login', message = '') {
  setAuthMode(mode);
  const messageEl = $('#authModalMessage');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.classList.toggle('show', Boolean(message));
  }
  $('#authModal')?.classList.add('open');
}

function hideAuthModal() {
  $('#authModal')?.classList.remove('open');
  const messageEl = $('#authModalMessage');
  if (messageEl) {
    messageEl.textContent = '';
    messageEl.classList.remove('show');
  }
}

function setAuthMode(mode) {
  const isRegister = mode === 'register';
  if ($('#authModalTitle')) $('#authModalTitle').textContent = isRegister ? 'Create account' : 'Log in';
  $('#authLoginTab')?.classList.toggle('active', !isRegister);
  $('#authRegisterTab')?.classList.toggle('active', isRegister);
  $('#loginForm')?.classList.toggle('active', !isRegister);
  $('#registerForm')?.classList.toggle('active', isRegister);
}

function updateProfileUI(user = state.user) {
  if (!$('#profileUsername')) return;
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
  clearLegacySharedStorage();
  state.isAuthenticated = window.IncantoAuth?.isAuthenticated() || false;
  state.user = window.IncantoAuth?.getUser() || null;

  if (state.isAuthenticated) {
    state.favorites = readScopedArray('favorites');
    state.cart = Array.isArray(state.user?.cart) ? state.user.cart : [];
    state.recentlyViewed = Array.isArray(state.user?.recentlyViewed) ? state.user.recentlyViewed : [];
    state.orders = Array.isArray(state.user?.orders) ? state.user.orders : [];
    writeScopedArray('cart', state.cart);
    writeScopedArray('recentlyViewed', state.recentlyViewed);
    writeScopedArray('orders', state.orders);
  } else {
    state.favorites = [];
    state.cart = [];
    state.recentlyViewed = [];
    state.orders = [];
  }

  if ($('#loginBtn')) $('#loginBtn').style.display = state.isAuthenticated ? 'none' : 'inline-flex';
  if ($('#mobileLoginBtn')) $('#mobileLoginBtn').style.display = state.isAuthenticated ? 'none' : 'block';
  if ($('#profileBtn')) $('#profileBtn').style.display = state.isAuthenticated ? 'inline-flex' : 'none';
  if ($('#mobileProfileBtn')) $('#mobileProfileBtn').style.display = state.isAuthenticated ? 'block' : 'none';
  if ($('#logoutBtn')) $('#logoutBtn').style.display = state.isAuthenticated ? 'inline-flex' : 'none';
  updateProfileUI();
  updateFavoritesUI();
  updateCartUI();
  renderRecentlyViewed();
  renderOrdersPage();
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
    updateStoredUser(data.data.user);
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
  $('#googleSetupBtn')?.addEventListener('click', () => showToast('Paste your Google OAuth client ID in frontend/user.js first.'));
  window.addEventListener('incanto:auth-change', updateAuthUI);
  window.addEventListener('load', initGoogleSignIn);
  updateAuthUI();
}

function handleRouting() {
  if (IS_PAYMENT_PAGE) {
    window.scrollTo({ top: 0 });
    $('#mobileMenu')?.classList.remove('open');
    $('#hamburger')?.setAttribute('aria-expanded', 'false');
    $('#hamburger')?.setAttribute('aria-label', 'Open menu');
    return;
  }
  const hash = window.location.hash || '#home';
  const targetId = hash.replace('#', '');
  if (targetId === 'payment' && !IS_PAYMENT_PAGE) {
    window.location.href = 'payment.html';
    return;
  }
  if (['profile', 'cart', 'orders', 'purchase', 'purchase-final', 'payment'].includes(targetId) && !state.isAuthenticated) {
    showAuthModal('login', 'Please log in to view your private account area.');
    showToast('Please log in to continue.');
    window.location.hash = '#home';
    return;
  }
  const nestedShopViews = ['cart', 'payment', 'orders'];
  const isNestedShopView = nestedShopViews.includes(targetId);
  const isHomeView = ['home','hero','how','finder','results','about'].includes(targetId);
  $('#home')?.classList.toggle('subpage-active', isNestedShopView);
  $$('.view-section').forEach(sec => {
    const shouldShowHome = sec.id === 'home' && (isHomeView || isNestedShopView);
    const shouldShowTarget = !isHomeView && sec.id === targetId;
    sec.classList.toggle('active', shouldShowHome || shouldShowTarget);
  });
  if (!document.querySelector('.view-section.active')) $('#home')?.classList.add('active');
  if (targetId === 'cart') renderCartPage();
  if (targetId === 'orders') renderOrdersPage();
  if (isHomeView && targetId !== 'home') {
    setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 10);
  } else {
    window.scrollTo({ top: 0 });
  }
  $('#mobileMenu')?.classList.remove('open');
  $('#hamburger')?.setAttribute('aria-expanded', 'false');
  $('#hamburger')?.setAttribute('aria-label', 'Open menu');
}

window.addEventListener('hashchange', handleRouting);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('#favsModal').classList.remove('open');
    hideAuthModal();
    if ($('#purchaseSuccessModal')?.classList.contains('open')) {
      closePurchaseSuccessPopup();
      return;
    }
    if (window.location.hash === '#purchase' || window.location.hash === '#purchase-final' || window.location.hash === '#payment') cancelPurchase();
  }
});

/* ─── INIT ───────────────────────────────── */
function initAIToggle() {
  const toggle = $('#aiToggle');
  const label  = $('#aiToggleLabel');
  if (!toggle || !label) return;
  toggle.checked = state.useAI;
  label.textContent = state.useAI ? '✦ AI Ranking: On' : 'AI Ranking: Off';
  toggle.addEventListener('change', function () {
    state.useAI = this.checked;
    label.textContent = state.useAI ? '✦ AI Ranking: On' : 'AI Ranking: Off';
    showToast(state.useAI ? '✦ AI ranking enabled' : 'AI ranking off — rule-based results');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initAuth();
  initAIToggle();
  if (!IS_PAYMENT_PAGE) {
    initFinder();
    initBudgetSlider();
    initFilters();
    updateFavoritesUI();
  }
  updateCartUI();
  renderOrdersPage();
  renderRecentlyViewed();
  if (!IS_PAYMENT_PAGE) {
    initBuyButtons();
    initStaticTrendingCards();
  }
  $('#confirmPurchaseBtn')?.addEventListener('click', confirmPurchase);
  $('#continueToPaymentBtn')?.addEventListener('click', continueToPayment);
  $('#quickViewCartBtn')?.addEventListener('click', showCartPage);
  $('#quickCheckoutNowBtn')?.addEventListener('click', showCartPurchaseConfirmation);
  $('#cancelPurchaseBtn')?.addEventListener('click', cancelPurchase);
  $('#purchaseCancelBtn')?.addEventListener('click', cancelPurchase);
  $('#finalPurchaseCancelBtn')?.addEventListener('click', cancelPurchase);
  $('#finalPurchaseBackBtn')?.addEventListener('click', backToPurchase);
  $('#backToPurchaseBtn')?.addEventListener('click', backToPurchase);
  $('#purchaseSuccessClose')?.addEventListener('click', closePurchaseSuccessPopup);
  $('#purchaseSuccessModal')?.addEventListener('click', (event) => {
    if (event.target === $('#purchaseSuccessModal')) closePurchaseSuccessPopup();
  });
  $('#paymentForm')?.addEventListener('submit', handlePaymentSubmit);
  $('#checkoutCartBtn')?.addEventListener('click', showCartPurchaseConfirmation);
  $('#applyVoucherBtn')?.addEventListener('click', () => applyVoucher($('#voucherCode')?.value));
  $$('.payment-method input').forEach(input => {
    input.addEventListener('change', () => setPaymentMethod(input.value));
  });
  setPaymentMethod('card');
  hydrateCheckoutPage();
  handleRouting();
});