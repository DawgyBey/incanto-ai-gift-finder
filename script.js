// script.js

// Background Floating Animation Setup
const floatingContainer = document.getElementById('floating-bg');
const icons = ['❤️', '🎁', '✨', '🎈'];

function createFloatingElement() {
    const element = document.createElement('div');
    element.className = 'float-item';
    
    // Randomize properties
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const startX = Math.random() * 100;
    const duration = 15 + Math.random() * 10;
    const delay = Math.random() * 5;
    const size = 14 + Math.random() * 10;

    element.innerText = icon;
    element.style.left = `${startX}%`;
    element.style.fontSize = `${size}px`;
    element.style.animationDuration = `${duration}s`;
    element.style.animationDelay = `${delay}s`;

    floatingContainer.appendChild(element);

    // Remove element after animation to keep DOM clean
    setTimeout(() => {
        element.remove();
    }, (duration + delay) * 1000);
}

// Spawn elements periodically
setInterval(createFloatingElement, 2000);

// Initialize with a few elements
for(let i = 0; i < 5; i++) {
    createFloatingElement();
}

// Simple form handling prevent default
document.querySelector('.gift-card').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const originalText = btn.innerHTML;
    
    // Visual feedback
    btn.innerHTML = 'Searching...';
    btn.style.opacity = '0.8';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        alert("Our AI concierge is looking for the perfect gift! (Simulation)");
    }, 1500);
});