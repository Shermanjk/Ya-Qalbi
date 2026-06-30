// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — Butterfly Animations
// ═══════════════════════════════════════════════════════════════

// ─── Palettes [wingColor, darkBorder, spotColor] ─────────────
const BUTTERFLY_PALETTES = [
  ['#1e90ff','#0a2a6e','#00ced1'],  // blue morpho (reference)
  ['#a855f7','#3b0764','#c084fc'],  // purple morpho
  ['#f472b6','#831843','#fb7185'],  // pink morpho
  ['#34d399','#064e3b','#6ee7b7'],  // emerald morpho
  ['#fb923c','#7c2d12','#fcd34d'],  // amber morpho
];

// ─── Top-down flying SVG (used for float-on-click) ───────────
// Full wingspan spread, veins, spots, body, antennae — top view
function makeFlyingSVG(palette) {
  const [mid, dark, spot] = palette;
  // Unique gradient IDs per instance to avoid SVG defs collisions
  const uid = Math.random().toString(36).slice(2, 7);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="100%" height="100%">
    <defs>
      <radialGradient id="ulw${uid}" cx="35%" cy="30%" r="75%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="1"/>
        <stop offset="50%"  stop-color="${mid}"  stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="urw${uid}" cx="65%" cy="30%" r="75%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="1"/>
        <stop offset="50%"  stop-color="${mid}"  stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="llw${uid}" cx="30%" cy="65%" r="70%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="lrw${uid}" cx="70%" cy="65%" r="70%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="0.9"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
    </defs>

    <!-- Left upper wing -->
    <path d="M60 45 C55 28, 38 10, 20 8 C6 6, -2 18, 5 32 C10 42, 30 50, 50 52 C55 52, 59 50, 60 45Z"
          fill="url(#ulw${uid})" stroke="${dark}" stroke-width="1.2"/>
    <!-- Left upper border shading -->
    <path d="M20 8 C6 6, -2 18, 5 32 C10 42, 30 50, 50 52"
          fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
    <!-- Left upper veins -->
    <path d="M60 45 C48 38, 32 28, 18 18 M60 45 C50 40, 36 38, 22 34 M60 45 C52 44, 40 46, 28 46"
          fill="none" stroke="${dark}" stroke-width="0.7" opacity="0.55"/>
    <!-- Left upper spots -->
    <circle cx="14" cy="20" r="2.5" fill="${spot}" opacity="0.88"/>
    <circle cx="20" cy="13" r="2"   fill="${spot}" opacity="0.80"/>
    <circle cx="28" cy="10" r="1.8" fill="${spot}" opacity="0.72"/>

    <!-- Right upper wing (mirror) -->
    <path d="M60 45 C65 28, 82 10, 100 8 C114 6, 122 18, 115 32 C110 42, 90 50, 70 52 C65 52, 61 50, 60 45Z"
          fill="url(#urw${uid})" stroke="${dark}" stroke-width="1.2"/>
    <path d="M100 8 C114 6, 122 18, 115 32 C110 42, 90 50, 70 52"
          fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
    <path d="M60 45 C72 38, 88 28, 102 18 M60 45 C70 40, 84 38, 98 34 M60 45 C68 44, 80 46, 92 46"
          fill="none" stroke="${dark}" stroke-width="0.7" opacity="0.55"/>
    <circle cx="106" cy="20" r="2.5" fill="${spot}" opacity="0.88"/>
    <circle cx="100" cy="13" r="2"   fill="${spot}" opacity="0.80"/>
    <circle cx="92"  cy="10" r="1.8" fill="${spot}" opacity="0.72"/>

    <!-- Left lower wing (scalloped) -->
    <path d="M60 52 C52 56, 38 62, 24 68 C12 73, 5 72, 8 62 C12 52, 28 48, 44 48 C52 48, 58 50, 60 52Z"
          fill="url(#llw${uid})" stroke="${dark}" stroke-width="1"/>
    <!-- Scallop bumps -->
    <path d="M8 62 C4 68, 4 74, 8 76 M16 67 C12 73, 12 79, 16 80 M25 70 C22 76, 22 81, 26 82"
          fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    <path d="M60 52 C50 56, 36 60, 22 64 M60 52 C52 54, 38 55, 26 56"
          fill="none" stroke="${dark}" stroke-width="0.6" opacity="0.45"/>

    <!-- Right lower wing (mirror) -->
    <path d="M60 52 C68 56, 82 62, 96 68 C108 73, 115 72, 112 62 C108 52, 92 48, 76 48 C68 48, 62 50, 60 52Z"
          fill="url(#lrw${uid})" stroke="${dark}" stroke-width="1"/>
    <path d="M112 62 C116 68, 116 74, 112 76 M104 67 C108 73, 108 79, 104 80 M95 70 C98 76, 98 81, 94 82"
          fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    <path d="M60 52 C70 56, 84 60, 98 64 M60 52 C68 54, 82 55, 94 56"
          fill="none" stroke="${dark}" stroke-width="0.6" opacity="0.45"/>

    <!-- Body -->
    <ellipse cx="60" cy="50" rx="3" ry="18" fill="#111"/>
    <ellipse cx="60" cy="35" rx="2.5" ry="5" fill="#222"/>
    <circle  cx="60" cy="29" r="3.5" fill="#1a1a1a"/>

    <!-- Antennae -->
    <path d="M58 28 C52 20, 46 14, 42 8" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="42" cy="8" r="2.2" fill="#111"/>
    <path d="M62 28 C68 20, 74 14, 78 8" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="78" cy="8" r="2.2" fill="#111"/>
  </svg>`;
}

// ─── Side-profile landed SVG (used for tagline landing) ──────
function makeButterflySVG(palette) {
  const [mid, dark, spot] = palette;
  const uid = Math.random().toString(36).slice(2, 7);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" width="100%" height="100%">
    <defs>
      <radialGradient id="uwg${uid}" cx="60%" cy="30%" r="70%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="1"/>
        <stop offset="55%"  stop-color="${mid}"  stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="lwg${uid}" cx="40%" cy="40%" r="70%">
        <stop offset="0%"   stop-color="${mid}"  stop-opacity="0.9"/>
        <stop offset="60%"  stop-color="${mid}"  stop-opacity="0.7"/>
        <stop offset="100%" stop-color="${dark}" stop-opacity="1"/>
      </radialGradient>
    </defs>

    <!-- Upper wing -->
    <path d="M82 95 C78 80, 72 55, 68 35 C64 15, 70 5, 80 8
             C95 12, 118 25, 130 45 C140 60, 138 78, 128 88
             C115 100, 95 98, 82 95 Z"
          fill="url(#uwg${uid})" stroke="${dark}" stroke-width="2.5"/>
    <path d="M80 8 C95 12, 118 25, 130 45 C140 60, 138 78, 128 88"
          fill="none" stroke="${dark}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>
    <path d="M82 95 C95 75, 110 55, 125 42 M82 95 C100 78, 118 62, 130 52
             M82 95 C98 82, 112 70, 122 62 M82 95 C94 86, 105 80, 114 76"
          fill="none" stroke="${dark}" stroke-width="0.9" opacity="0.5"/>
    <circle cx="88"  cy="22" r="3"   fill="${spot}" opacity="0.9"/>
    <circle cx="98"  cy="15" r="2.5" fill="${spot}" opacity="0.85"/>
    <circle cx="110" cy="14" r="2"   fill="${spot}" opacity="0.8"/>
    <circle cx="120" cy="18" r="2"   fill="${spot}" opacity="0.75"/>

    <!-- Lower wing -->
    <path d="M82 95 C75 100, 60 105, 48 110 C32 116, 18 118, 12 112
             C5 105, 8 95, 18 90 C26 86, 38 88, 46 84
             C54 80, 62 78, 68 80 C74 82, 78 88, 82 95 Z"
          fill="url(#lwg${uid})" stroke="${dark}" stroke-width="2"/>
    <path d="M18 90 C14 97, 10 100, 12 112 M28 88 C22 96, 18 104, 20 112
             M38 87 C33 96, 30 106, 32 114 M48 87 C44 96, 42 106, 44 112
             M58 83 C56 92, 55 100, 56 108"
          fill="none" stroke="${dark}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
    <path d="M82 95 C68 97, 50 100, 35 104 M82 95 C70 94, 55 92, 40 93
             M82 95 C72 90, 58 86, 44 85"
          fill="none" stroke="${dark}" stroke-width="0.8" opacity="0.45"/>

    <!-- Body -->
    <ellipse cx="82" cy="105" rx="6" ry="22" fill="#1a1a1a"/>
    <line x1="76" y1="100" x2="88" y2="100" stroke="#333" stroke-width="1"/>
    <line x1="76" y1="107" x2="88" y2="107" stroke="#333" stroke-width="1"/>
    <line x1="76" y1="114" x2="88" y2="114" stroke="#333" stroke-width="1"/>
    <line x1="76" y1="121" x2="88" y2="121" stroke="#333" stroke-width="1"/>
    <ellipse cx="82" cy="93" rx="7" ry="8" fill="#222"/>
    <circle  cx="82" cy="84" r="5.5" fill="#2a2a2a"/>
    <circle  cx="83" cy="83" r="2"   fill="#444"/>

    <!-- Antennae -->
    <path d="M79 80 C72 65, 65 52, 60 40" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="60" cy="40" r="3" fill="#1a1a1a"/>
    <path d="M85 80 C82 65, 82 52, 84 40" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="84" cy="40" r="3" fill="#1a1a1a"/>

    <!-- Legs -->
    <path d="M80 108 C70 116, 58 122, 48 128" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M82 112 C74 120, 65 126, 56 134" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M82 118 C76 126, 70 132, 64 140" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M84 108 C94 116, 104 122, 112 128" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M84 113 C92 122, 100 128, 108 136" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M84 119 C90 128, 94 135, 96 143" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

// ─── Floating butterflies — heart-click, viewer mode ─────────
// Uses JS-driven animation via requestAnimationFrame for smooth,
// realistic S-curve flight with natural wing-flap depth.
function spawnFloatingButterflies(W, H) {
  const COUNT = 10;

  for (let i = 0; i < COUNT; i++) {
    const palette = BUTTERFLY_PALETTES[Math.floor(Math.random() * BUTTERFLY_PALETTES.length)];

    // Wrapper: handles position on screen
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9998;
      will-change: transform, opacity;
    `;

    // Inner: holds the SVG and rotates with flight direction
    const inner = document.createElement('div');
    inner.style.cssText = `display: block; will-change: transform;`;
    inner.innerHTML = makeFlyingSVG(palette);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    // Per-butterfly physics params
    const segment  = W / COUNT;
    const startX   = segment * i + Math.random() * segment;
    const bsz      = 42 + Math.random() * 28;       // 42–70px
    const speed    = 0.28 + Math.random() * 0.18;   // vh/frame
    const wobbleAmp = 18 + Math.random() * 22;      // px horizontal wobble
    const wobbleFreq = 0.025 + Math.random() * 0.02;
    const flapSpeed  = 120 + Math.random() * 80;    // ms per half-flap
    const delay      = Math.random() * 700;          // ms before launch
    const peakOpacity = 0.88 + Math.random() * 0.10;

    // SVG element for wing flap
    const svg = inner.querySelector('svg');
    svg.style.cssText = `
      display: block;
      width: ${bsz}px;
      height: ${bsz}px;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.35))
              drop-shadow(0 0 14px rgba(80,160,255,0.40));
    `;

    let startTime  = null;
    let phase      = 0;        // sine phase for horizontal wobble
    let flapPhase  = 0;        // wing flap phase
    let lastFlap   = 0;
    let flapOpen   = true;
    let opacity    = 0;
    let launched   = false;

    const totalDuration = (4500 + Math.random() * 2500) + delay;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      // Respect delay
      if (elapsed < delay) { requestAnimationFrame(frame); return; }
      if (!launched) {
        launched = true;
        // Place at bottom
        wrapper.style.left   = `${startX}px`;
        wrapper.style.bottom = `-${bsz + 10}px`;
        wrapper.style.top    = 'auto';
      }

      const t = (elapsed - delay) / (totalDuration - delay); // 0→1
      if (t >= 1) { wrapper.remove(); return; }

      // Vertical: move upward
      const vy = speed * (window.innerHeight / 100); // px per frame
      const curBottom = parseFloat(wrapper.style.bottom || '0');
      wrapper.style.bottom = `${curBottom + vy}px`;

      // Horizontal: smooth sine-wave wobble
      phase += wobbleFreq;
      const dx = Math.sin(phase) * wobbleAmp;
      const dy = Math.cos(phase) * 6; // slight vertical bob

      // Tilt the inner div to follow flight direction
      const tiltX = (Math.cos(phase) * wobbleFreq * wobbleAmp) * 1.5; // dx/dt
      const tiltY = -speed * 8;

      inner.style.transform = `
        translate(${dx}px, ${dy}px)
        rotate(${Math.atan2(tiltX, -tiltY) * (180 / Math.PI) * 0.35}deg)
      `;

      // Wing flap: alternate scaleX with easing
      if (ts - lastFlap > flapSpeed) {
        flapOpen = !flapOpen;
        lastFlap = ts;
      }
      const flapProgress = Math.min(1, (ts - lastFlap) / flapSpeed);
      // Ease in-out quad
      const ease = flapProgress < 0.5
        ? 2 * flapProgress * flapProgress
        : 1 - Math.pow(-2 * flapProgress + 2, 2) / 2;
      const scaleX = flapOpen
        ? 1 - ease * 0.75       // closing: 1 → 0.25
        : 0.25 + ease * 0.75;   // opening: 0.25 → 1
      svg.style.transform = `scaleX(${scaleX})`;

      // Opacity: fade in quickly, hold, fade out near top
      if (t < 0.08)       opacity = peakOpacity * (t / 0.08);
      else if (t < 0.72)  opacity = peakOpacity;
      else                opacity = peakOpacity * (1 - (t - 0.72) / 0.28);
      wrapper.style.opacity = opacity;

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }
}

// ─── Tagline landing butterflies ─────────────────────────────
function launchTaglineButterflies() {
  const textEl = document.getElementById('tagline-text');
  if (!textEl) return;

  document.querySelectorAll('.landing-butterfly').forEach(el => el.remove());

  const PALETTES = [
    ['#1e90ff','#0a2a6e','#00ced1'],
    ['#1e90ff','#0a2a6e','#00ced1'],
    ['#2196f3','#0d2b6e','#26c6da'],
    ['#42a5f5','#0a2a6e','#00bcd4'],
    ['#1e90ff','#112244','#00e5ff'],
  ];

  const COUNT   = 5;
  const rect    = textEl.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;

  for (let i = 0; i < COUNT; i++) {
    const frac   = (i + 0.5) / COUNT;
    const landX  = rect.left + scrollX + rect.width  * frac;
    const landY  = rect.top  + scrollY + rect.height * 0.1;

    const el     = document.createElement('div');
    el.className = 'landing-butterfly';

    const bsz      = 60 + Math.random() * 28;
    const delay    = 0.3 + i * 0.38 + Math.random() * 0.12;
    const dur      = 1.6 + Math.random() * 0.8;
    const lflap    = `${2.0 + Math.random() * 1.6}s`;
    const palette  = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const perchRot = (Math.random() - 0.5) * 22;

    const angle = Math.random() * Math.PI * 2;
    const dist  = 280 + Math.random() * 200;
    const ax    = Math.cos(angle) * dist;
    const ay    = Math.sin(angle) * dist;
    const ar    = (Math.random() - 0.5) * 60;

    el.style.cssText = `
      position: absolute;
      left: ${landX - bsz * 0.52}px;
      top:  ${landY - bsz * 0.65}px;
      width:  ${bsz}px;
      height: ${bsz}px;
      z-index: 9997;
      pointer-events: none;
      will-change: transform, opacity;
      --lflap: ${lflap};
      --ax: ${ax}px;
      --ay: ${ay}px;
      --ar: ${ar}deg;
      opacity: 0;
      animation: butterflyApproach ${dur}s cubic-bezier(0.22,1,0.36,1) ${delay}s forwards;
    `;
    el.innerHTML = makeButterflySVG(palette);

    el.addEventListener('animationend', () => {
      el.style.opacity   = '1';
      el.style.transform = `rotate(${perchRot}deg)`;
      el.style.animation = 'none';
      const svg = el.querySelector('svg');
      if (svg) svg.style.animation = `landedWingRest ${lflap} ease-in-out infinite alternate`;
    }, { once: true });

    document.body.appendChild(el);
  }
}
