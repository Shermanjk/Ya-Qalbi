// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — Our Shared Diary
// Write messages in customizable envelopes
// ═══════════════════════════════════════════════════════════════

let _diaryEntries = [];
let _selectedColor = '#e8a598';
let _selectedSeal = 'heart';
let _currentEnvelope = null;

const SEAL_EMOJIS = {
  heart: '❤️',
  star: '⭐',
  flower: '🌸',
  moon: '🌙',
  butterfly: '🦋'
};

// ── Add envelope styles ──────────────────────────────────────
function addDiaryStyles() {
  const style = document.createElement('style');
  style.id = 'diary-styles';
  style.textContent = `
    /* Floating hearts animation */
    .floating-hearts {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }
    .heart-float {
      position: absolute;
      bottom: -20px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 18px;
      animation: floatHeart 10s ease-in infinite;
    }
    @keyframes floatHeart {
      0% {
        bottom: -20px;
        opacity: 0;
        transform: translateX(0) rotate(0deg) scale(0.8);
      }
      10% {
        opacity: 0.7;
      }
      50% {
        transform: translateX(20px) rotate(10deg) scale(1);
      }
      90% {
        opacity: 0.7;
      }
      100% {
        bottom: 100%;
        opacity: 0;
        transform: translateX(-10px) rotate(-10deg) scale(0.8);
      }
    }
    .envelope-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.7);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .envelope-modal.active {
      opacity: 1;
    }
    .envelope-container {
      position: relative;
      width: 340px;
      height: 240px;
      transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .envelope-fly {
      animation: flyToCenter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes flyToCenter {
      0% { transform: scale(1); }
      100% { transform: scale(1.4); }
    }
    /* Envelope body (back) */
    .envelope-body {
      position: absolute;
      inset: 0;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    /* Envelope front (covers bottom of letter) */
    .envelope-front-cover {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 55%;
      border-radius: 0 0 8px 8px;
      z-index: 25;
      transition: opacity 0.5s ease;
    }
    .envelope-open .envelope-front-cover {
      opacity: 0;
      pointer-events: none;
    }
    /* Top flap */
    .envelope-flap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50%;
      transform-origin: top center;
      transition: transform 1s ease-in-out;
      z-index: 30;
    }
    .envelope-flap-inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      clip-path: polygon(0 0, 50% 100%, 100% 0);
    }
    .envelope-open .envelope-flap {
      transform: rotateX(180deg);
      z-index: 5;
    }
    .envelope-seal {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 44px;
      z-index: 35;
      transition: opacity 0.4s ease, transform 0.4s ease;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
    }
    .envelope-open .envelope-seal {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.3);
    }
    /* Letter inside */
    .envelope-letter {
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%) translateY(0);
      width: 300px;
      max-height: 140px;
      overflow-y: auto;
      background: #fff;
      border-radius: 4px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.8s ease-in-out, max-height 0.8s ease-in-out;
      z-index: 15;
      box-sizing: border-box;
    }
    .envelope-letter::-webkit-scrollbar {
      width: 6px;
    }
    .envelope-letter::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .envelope-letter::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
    .envelope-letter::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        transparent,
        transparent 27px,
        rgba(0,0,0,0.03) 27px,
        rgba(0,0,0,0.03) 28px
      );
      pointer-events: none;
      border-radius: 4px;
    }
    .envelope-letter p {
      margin: 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .envelope-open .envelope-letter {
      transform: translateX(-50%) translateY(-180px);
      max-height: 300px;
      transition-delay: 0.5s;
    }
    .envelope-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.95);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      transition: transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .envelope-close:hover {
      transform: scale(1.1);
      background: white;
    }
    /* Grid envelope styles */
    .envelope-card {
      position: relative;
      width: 100%;
      aspect-ratio: 1.5;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .envelope-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 40px rgba(0,0,0,0.25);
    }
    .envelope-card-body {
      position: absolute;
      inset: 0;
      border-radius: 8px;
    }
    .envelope-card-flap {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50%;
      clip-path: polygon(0 0, 50% 100%, 100% 0);
      z-index: 4;
    }
    .envelope-card-seal {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 32px;
      z-index: 5;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    .envelope-card-info {
      position: absolute;
      bottom: 15%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 5;
    }
  `;
  document.head.appendChild(style);
}

// ── Load diary entries from localStorage ──────────────────────
function loadDiaryEntries() {
  try {
    const stored = localStorage.getItem('diary_entries');
    _diaryEntries = stored ? JSON.parse(stored) : [];
  } catch (e) {
    _diaryEntries = [];
  }
}

// ── Save diary entries to localStorage ────────────────────────
function saveDiaryEntries() {
  localStorage.setItem('diary_entries', JSON.stringify(_diaryEntries));
}

// ── Select envelope color ─────────────────────────────────────
function selectDiaryColor(color) {
  _selectedColor = color;
  document.querySelectorAll('.diary-color-btn').forEach(btn => {
    if (btn.dataset.color === color) {
      btn.classList.remove('border-transparent');
      btn.classList.add('border-primary/30');
    } else {
      btn.classList.remove('border-primary/30');
      btn.classList.add('border-transparent');
    }
  });
}

// ── Select seal type ──────────────────────────────────────────
function selectDiarySeal(seal) {
  _selectedSeal = seal;
  document.querySelectorAll('.diary-seal-btn').forEach(btn => {
    if (btn.dataset.seal === seal) {
      btn.classList.remove('border-transparent');
      btn.classList.add('border-primary/30');
    } else {
      btn.classList.remove('border-primary/30');
      btn.classList.add('border-transparent');
    }
  });
}

// ── Save new diary entry ──────────────────────────────────────
function saveDiaryEntry() {
  const messageEl = document.getElementById('diary-message');
  const message = messageEl.value.trim();
  
  if (!message) {
    alert('Please write a message first!');
    return;
  }
  
  const entry = {
    id: Date.now(),
    message: message,
    color: _selectedColor,
    seal: _selectedSeal,
    date: new Date().toISOString(),
    opened: false
  };
  
  _diaryEntries.unshift(entry);
  saveDiaryEntries();
  renderDiaryEntries();
  
  // Clear form
  messageEl.value = '';
}

// ── Toggle envelope open/close ────────────────────────────────
function toggleEnvelope(id) {
  const entry = _diaryEntries.find(e => e.id === id);
  if (entry) {
    openEnvelopeModal(entry);
  }
}

// ── Open envelope modal with animation ────────────────────────
function openEnvelopeModal(entry) {
  const darkerColor = adjustColor(entry.color, -20);
  const lighterColor = adjustColor(entry.color, 20);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'envelope-modal';
  modal.innerHTML = `
    <button class="envelope-close" onclick="closeEnvelopeModal()">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="envelope-container">
      <!-- Envelope body (back) -->
      <div class="envelope-body" style="background: ${entry.color};"></div>
      
      <!-- Letter inside -->
      <div class="envelope-letter">
        <p style="color:#000 !important;font-size:12px;margin-bottom:6px;font-weight:500;">${new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p style="color:#000 !important;font-family:'EB Garamond',serif;font-size:15px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;">${escapeHtml(entry.message)}</p>
      </div>
      
      <!-- Envelope front (covers bottom of letter) -->
      <div class="envelope-front-cover" style="background: ${entry.color};"></div>
      
      <!-- Top flap -->
      <div class="envelope-flap">
        <div class="envelope-flap-inner" style="background: linear-gradient(180deg, ${lighterColor}, ${entry.color});"></div>
      </div>
      
      <!-- Seal -->
      <div class="envelope-seal">${SEAL_EMOJIS[entry.seal] || '❤️'}</div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Fade in
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  
  // Fly and open after delay
  setTimeout(() => {
    const container = modal.querySelector('.envelope-container');
    container.classList.add('envelope-fly');
  }, 300);
  
  setTimeout(() => {
    const container = modal.querySelector('.envelope-container');
    container.classList.add('envelope-open');
    // Mark as opened
    entry.opened = true;
    saveDiaryEntries();
  }, 1000);
  
  _currentEnvelope = modal;
}

// ── Adjust color brightness ───────────────────────────────────
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ── Close envelope modal ──────────────────────────────────────
function closeEnvelopeModal() {
  if (_currentEnvelope) {
    const container = _currentEnvelope.querySelector('.envelope-container');
    
    // First, close the flap (seal the envelope) - letter slides back via CSS
    if (container) {
      container.classList.remove('envelope-open');
    }
    
    // Wait for letter to slide back and flap to close, then fade out
    setTimeout(() => {
      _currentEnvelope.classList.remove('active');
      setTimeout(() => {
        _currentEnvelope.remove();
        _currentEnvelope = null;
        renderDiaryEntries();
      }, 300);
    }, 1200);
  }
}

// ── Delete diary entry ────────────────────────────────────────
function deleteDiaryEntry(id) {
  if (confirm('Delete this message?')) {
    _diaryEntries = _diaryEntries.filter(e => e.id !== id);
    saveDiaryEntries();
    renderDiaryEntries();
  }
}

// ── Render all diary entries ──────────────────────────────────
function renderDiaryEntries() {
  const container = document.getElementById('diary-entries');
  if (!container) return;
  
  if (_diaryEntries.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="font-body-lg text-secondary italic">No messages yet. Write the first one!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = _diaryEntries.map(entry => {
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const sealEmoji = SEAL_EMOJIS[entry.seal] || '❤️';
    
    if (entry.opened) {
      // Opened envelope - show as sealed (closed) envelope that can be re-opened
      const darkerColor = adjustColor(entry.color, -20);
      const lighterColor = adjustColor(entry.color, 20);
      return `
        <div class="relative group">
          <div class="envelope-card" onclick="openEnvelopeModal(_diaryEntries.find(e=>e.id===${entry.id}))" style="aspect-ratio: 1.5;">
            <!-- Envelope body -->
            <div class="envelope-card-body" style="background: ${entry.color};"></div>
            <!-- Top flap (closed) -->
            <div class="envelope-card-flap" style="background: linear-gradient(180deg, ${lighterColor}, ${entry.color});"></div>
            <!-- Seal -->
            <div class="envelope-card-seal">${sealEmoji}</div>
            <!-- Info -->
            <div class="envelope-card-info">
              <p class="font-label-sm text-white/90">Tap to read</p>
              <p class="font-label-sm text-white/60 text-xs">${dateStr}</p>
            </div>
          </div>
          <button onclick="event.stopPropagation(); deleteDiaryEntry(${entry.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1 text-secondary hover:text-error z-10">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      `;
    } else {
      // Closed envelope - realistic shape
      const darkerColor = adjustColor(entry.color, -20);
      const lighterColor = adjustColor(entry.color, 20);
      return `
        <div class="relative group">
          <div onclick="toggleEnvelope(${entry.id})" class="envelope-card">
            <!-- Envelope body -->
            <div class="envelope-card-body" style="background: ${entry.color};"></div>
            <!-- Top flap -->
            <div class="envelope-card-flap" style="background: linear-gradient(180deg, ${lighterColor}, ${entry.color});"></div>
            <!-- Seal -->
            <div class="envelope-card-seal">${sealEmoji}</div>
            <!-- Info -->
            <div class="envelope-card-info">
              <p class="font-label-sm text-white/90">Tap to open</p>
              <p class="font-label-sm text-white/60 text-xs">${dateStr}</p>
            </div>
          </div>
          <button onclick="event.stopPropagation(); deleteDiaryEntry(${entry.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1 text-secondary hover:text-error z-10">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      `;
    }
  }).join('');
}

// ── Escape HTML to prevent XSS ────────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Initialize diary ──────────────────────────────────────────
function initDiary() {
  addDiaryStyles();
  loadDiaryEntries();
  renderDiaryEntries();
  selectDiaryColor(_selectedColor);
  selectDiarySeal(_selectedSeal);
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiary);
} else {
  initDiary();
}
