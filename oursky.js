// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — Our Sky (Star Map)
// Renders a real star map for Pagadian City, Philippines
// on June 26, 2026 — the night they became official.
// ═══════════════════════════════════════════════════════════════

// ─── Default config (partner can edit) ──────────────────────
const SKY_CONFIG = {
  date:     { year: 2026, month: 6, day: 26 }, // June 26, 2026
  lat:      7.8278,    // Pagadian City latitude
  lon:      123.4367,  // Pagadian City longitude
  caption:  'June 26, 2026 · Where our story began',
  location: 'Pagadian City, Philippines',
};

// ─── Star catalogue (HYG subset: brightest ~900 stars) ──────
// Each entry: [ra_hours, dec_degrees, magnitude, name?]
// RA = right ascension (0–24h), Dec = declination (-90 to +90)
const STARS = [
  [6.7525,-16.7161,-1.46,'Sirius'],[6.3992,45.9980,0.08,'Capella'],
  [5.2423,-8.2016,0.12,'Rigel'],[14.6600,-60.8333,0.01,'Alpha Centauri'],
  [7.6553,5.2250,0.34,'Procyon'],[5.9193,7.4069,0.45,'Betelgeuse'],
  [18.6157,38.7836,0.03,'Vega'],[20.6905,45.2803,0.08,'Deneb'],
  [19.8463,8.8683,0.75,'Altair'],[4.5986,16.5093,0.85,'Aldebaran'],
  [22.9608,-29.6222,1.16,'Fomalhaut'],[13.4200,-11.1614,0.98,'Spica'],
  [16.4901,-26.4320,1.00,'Antares'],[10.1395,11.9672,1.35,'Regulus'],
  [5.4181,-1.2019,1.64,'Mintaka'],[5.5955,-1.2020,1.69,'Alnilam'],
  [5.6792,-1.9426,2.05,'Alnitak'],[1.0797,60.7167,2.23,'Schedar'],
  [12.9053,38.3183,1.79,'Cor Caroli'],[11.8177,14.5720,2.14,'Zosma'],
  [3.7913,24.1053,2.87,'Electra'],[3.7930,24.0300,3.63,'Taygeta'],
  [21.7364,-16.1271,2.38,'Enif'],[0.6552,56.5375,2.27,'Caph'],
  [21.4764,-22.4111,2.90,'Sadalsuud'],[22.0960,0.3219,2.83,'Equulei'],
  [14.8446,74.1556,2.08,'Kochab'],[2.5303,89.2641,1.97,'Polaris'],
  [7.4554,31.8883,1.93,'Castor'],[7.5755,31.8883,1.14,'Pollux'],
  [6.0377,-52.6957,1.67,'Canopus'],[9.4600,-43.4333,2.45,'Velorum'],
  [8.7236,-54.7089,1.86,'Avior'],[11.0629,-61.6853,2.64,'Miaplacidus'],
  [8.1597,47.1566,2.44,'Talitha'],[10.1228,49.9237,2.37,'Merak'],
  [11.0621,61.7510,2.44,'Phecda'],[11.8977,53.6948,2.37,'Megrez'],
  [12.2572,57.0325,2.44,'Alioth'],[13.7923,49.3133,1.86,'Mizar'],
  [13.9924,65.8687,1.77,'Alkaid'],[17.1727,-86.3844,2.86,'Octantis'],
  [15.7379,-33.6267,2.29,'Zubenelgenubi'],[15.9921,-22.6217,2.61,'Zubeneschamali'],
  [16.0055,-22.6217,2.75,'Zubenelakrab'],[18.9104,32.6897,3.05,'Sheliak'],
  [18.8346,33.3626,3.52,'Sulafat'],[19.6128,27.9597,3.51,'Albireo'],
  [20.3704,-14.7817,3.77,'Albali'],[21.5260,-5.5711,3.73,'Sadalmelik'],
  [22.6965,-46.8844,2.39,'Delta PsA'],[23.0654,-27.0447,3.01,'Skat'],
  [1.9109,29.5785,2.00,'Hamal'],[2.1197,23.4624,2.64,'Sheratan'],
  [2.8331,27.2614,2.90,'Mesarthim'],[3.0377,4.0897,2.53,'Menkar'],
  [3.9611,40.9564,2.10,'Mirfak'],[4.0347,47.0421,1.80,'Algol'],
  [5.6362,-1.2017,2.23,'Saiph'],[5.7953,-9.6697,0.18,'Rigel B'],
  [5.4188,-8.2016,2.06,'Bellatrix'],[5.5334,9.9342,1.65,'Tabit'],
  [6.0000,-13.1711,2.83,'Mirzam'],[7.0556,-29.3031,2.45,'Wezn'],
  [6.6285,-43.1956,2.45,'Adhara'],[6.9774,-28.9722,2.00,'Furud'],
  [17.7730,4.5675,2.56,'Rasalhague'],[17.5822,12.5600,2.77,'Rasalgethi'],
  [17.6243,-43.0239,2.81,'Shaula'],[17.7993,-40.1272,1.63,'Lesath'],
  [18.4022,-25.4217,2.60,'Kaus Australis'],[18.3493,-29.8281,2.70,'Kaus Media'],
  [18.2943,-21.0581,2.82,'Kaus Borealis'],[19.0433,-29.8806,2.99,'Nunki'],
  [18.0293,-30.0256,2.99,'Phi Sgr'],[17.5314,-37.1039,2.82,'Eta Oph'],
  [16.8397,-34.2936,2.29,'Graffias'],[16.9056,-28.2161,2.62,'Dschubba'],
  [16.3556,-25.5928,2.32,'Acrab'],[15.5404,26.7153,2.23,'Arcturus'],
  [14.2613,19.1822,2.14,'Muphrid'],[12.4437,-63.0992,1.25,'Acrux'],
  [12.5194,-57.1131,1.63,'Mimosa'],[12.3192,-57.1131,2.59,'Delta Cru'],
  [12.6438,-60.3583,3.59,'Epsilon Cru'],[10.9003,-60.4039,2.64,'Iota Car'],
  [9.2200,-69.7172,2.47,'Beta Car'],[6.8283,-50.6086,3.96,'Gamma Pup'],
  [8.0594,-24.3044,3.34,'Rho Pup'],[7.8217,-13.1761,3.61,'Xi Gem'],
  [6.3797,-17.9561,2.98,'Mu CMa'],[6.4906,-32.5081,3.02,'Nu CMa'],
  [6.9000,-28.9611,3.02,'Theta CMa'],[7.2833,-26.7706,3.25,'Nu2 CMa'],
  [3.1583,53.5069,2.67,'Almach'],[0.1398,29.0904,2.07,'Alpheratz'],
  [23.0793,15.2056,2.83,'Markab'],[22.6914,10.8317,2.49,'Scheat'],
  [23.0656,28.0830,2.84,'Algenib'],[21.7439,9.8758,2.44,'Sadalbari'],
  [22.7161,30.2211,2.91,'Delta Peg'],[15.5787,-41.1667,2.29,'Theta Cen'],
  [13.3256,-36.3678,0.61,'Hadar'],[13.9202,-60.3731,1.91,'Mimosa B'],
  [12.4437,-63.0992,0.77,'Alpha Cru'],[10.7194,-64.3944,1.67,'Epsilon Car'],
  [9.2847,-54.9739,2.23,'Upsilon Car'],[5.1008,-5.0864,3.19,'Rigel C'],
];

// ─── Constellation definitions [name, [[ra,dec],[ra,dec],...]] ─
const CONSTELLATIONS = [
  ['Orion', [[5.9193,7.4069],[5.5955,-1.2020],[5.6792,-1.9426],[5.4181,-1.2019],[5.5334,9.9342],[5.4188,-8.2016],[5.9193,7.4069]]],
  ['Ursa Major', [[10.1228,49.9237],[11.0621,61.7510],[11.8977,53.6948],[12.2572,57.0325],[13.7923,49.3133],[13.9924,65.8687],[13.7923,49.3133],[12.2572,57.0325],[11.8977,53.6948],[11.0621,61.7510],[10.1228,49.9237]]],
  ['Cassiopeia', [[1.0797,60.7167],[0.6552,56.5375],[0.1398,29.0904]]],
  ['Scorpius', [[16.4901,-26.4320],[16.9056,-28.2161],[17.5314,-37.1039],[17.6243,-43.0239],[17.7993,-40.1272]]],
  ['Leo', [[10.1395,11.9672],[11.8177,14.5720],[11.2352,20.5236],[10.3328,19.8413],[10.1395,11.9672]]],
  ['Gemini', [[7.6553,5.2250],[7.4554,31.8883],[7.5755,31.8883],[6.6285,-43.1956]]],
  ['Southern Cross', [[12.4437,-63.0992],[12.5194,-57.1131],[12.3192,-57.1131],[12.4437,-63.0992]]],
  ['Centaurus', [[14.6600,-60.8333],[13.3256,-36.3678],[13.9202,-60.3731]]],
  ['Lyra', [[18.6157,38.7836],[18.9104,32.6897],[18.8346,33.3626],[18.6157,38.7836]]],
  ['Aquila', [[19.8463,8.8683],[19.6128,27.9597],[20.3704,-14.7817]]],
  ['Cygnus', [[20.6905,45.2803],[19.6128,27.9597],[21.4764,-22.4111],[20.6905,45.2803]]],
  ['Canis Major', [[6.7525,-16.7161],[6.3797,-17.9561],[6.9774,-28.9722],[7.0556,-29.3031],[6.6285,-43.1956],[6.7525,-16.7161]]],
  ['Taurus', [[4.5986,16.5093],[3.7913,24.1053],[3.7930,24.0300]]],
  ['Perseus', [[3.9611,40.9564],[4.0347,47.0421],[3.1583,53.5069]]],
  ['Aries', [[1.9109,29.5785],[2.1197,23.4624],[2.8331,27.2614]]],
  ['Pegasus', [[23.0793,15.2056],[22.6914,10.8317],[22.7161,30.2211],[21.7439,9.8758],[23.0793,15.2056]]],
  ['Sagittarius', [[18.4022,-25.4217],[18.3493,-29.8281],[18.2943,-21.0581],[19.0433,-29.8806],[18.0293,-30.0256]]],
];

// ─── Astronomy math helpers ──────────────────────────────────

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

// Julian Date from calendar date
function julianDate(year, month, day, hour = 22) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5;
}

// Greenwich Mean Sidereal Time (degrees)
function gmst(jd) {
  const T = (jd - 2451545.0) / 36525;
  let g = 280.46061837 + 360.98564736629 * (jd - 2451545) + T * T * 0.000387933 - T * T * T / 38710000;
  return ((g % 360) + 360) % 360;
}

// Local Sidereal Time (degrees)
function lst(jd, lonDeg) {
  return (gmst(jd) + lonDeg + 360) % 360;
}

// Convert RA/Dec to Altitude/Azimuth
function equatorialToHorizontal(raDeg, decDeg, lstDeg, latDeg) {
  const ha = toRad(lstDeg - raDeg); // hour angle
  const dec = toRad(decDeg);
  const lat = toRad(latDeg);
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat));
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  return { alt: toDeg(alt), az: toDeg(az) };
}

// ─── Star notes (stored in localStorage + Supabase) ─────────
let _skyNotes = {};

async function loadSkyNotes() {
  const local = localStorage.getItem('ya-qalbi-sky-notes');
  if (local) { try { _skyNotes = JSON.parse(local); } catch { _skyNotes = {}; } }
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    const { data } = await sb.from('settings').select('value').eq('key', 'sky_notes').maybeSingle();
    if (data) { try { _skyNotes = JSON.parse(data.value); } catch {} }
  }
}

async function saveSkyNotes() {
  const json = JSON.stringify(_skyNotes);
  localStorage.setItem('ya-qalbi-sky-notes', json);
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    await sb.from('settings').upsert({ key: 'sky_notes', value: json, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
}

// ═══════════════════════════════════════════════════════════════
// OUR SKY — Interactive Star Map Renderer
// ═══════════════════════════════════════════════════════════════

let _skyCanvas, _skyCtx;
let _skyW, _skyH;
let _projectedStars = []; // { x, y, r, name, idx, baseBrightness, twinkleSpeed, twinkleOffset }
let _bgDustStars = [];    // { x, y, r, baseAlpha, twinkleSpeed, twinkleOffset }
let _activeNoteStar = null; // star index with tooltip open
let _editingStarIdx = null;
let _skyInitialized = false;
let _skyAnimFrame = null;
let _shootingStars = [];
let _musicParticles = []; // particles that fly from moon to player
let _skyTime = 0;
let _slowRotation = 0;
let _moonX = 0, _moonY = 0, _moonR = 0; // moon position for click detection
let _skySongPlaying = false;

// ── Initialise the sky map (called on navigate) ──────────────
async function initSkyMap() {
  if (_skyInitialized) { drawSky(); startSkyAnimation(); return; }
  _skyCanvas = document.getElementById('sky-canvas');
  if (!_skyCanvas) return;
  _skyCtx = _skyCanvas.getContext('2d');

  await loadSkyNotes();

  // Size the canvas
  _sizeSkyCanvas();
  window.addEventListener('resize', () => { _sizeSkyCanvas(); computeStarPositions(); drawSky(); });

  // Click handler
  _skyCanvas.addEventListener('click', onSkyCanvasClick);

  _skyInitialized = true;
  computeStarPositions();
  drawSky();
  startSkyAnimation();
}

// ── Compute star positions once (astronomy doesn't change per frame) ──
function computeStarPositions() {
  const W = _skyW, H = _skyH;
  const jd  = julianDate(SKY_CONFIG.date.year, SKY_CONFIG.date.month, SKY_CONFIG.date.day, 22);
  const lst_ = lst(jd, SKY_CONFIG.lon);
  const lat  = SKY_CONFIG.lat;

  // Generate background dust stars
  const rng = (function(s){return function(){s=(s*9301+49297)%233280;return s/233280;};})(42);
  _bgDustStars = [];
  for (let i = 0; i < 300; i++) {
    _bgDustStars.push({
      x: rng() * W,
      y: rng() * H,
      r: rng() * 0.8 + 0.2,
      baseAlpha: rng() * 0.4 + 0.1,
      twinkleSpeed: rng() * 2 + 0.5,
      twinkleOffset: rng() * Math.PI * 2
    });
  }

  // Project catalogue stars
  _projectedStars = [];
  STARS.forEach((star, idx) => {
    const [raH, decDeg, mag, name] = star;
    const raDeg  = raH * 15;
    const { alt, az } = equatorialToHorizontal(raDeg, decDeg, lst_, lat);
    if (alt <= 0) return;

    const r = (1 - alt / 90) * Math.min(W, H) * 0.45;
    const azRad = (az - 180) * Math.PI / 180;
    const cx = W / 2;
    const cy = H / 2;
    const x = cx + r * Math.sin(azRad);
    const y = cy - r * Math.cos(azRad);

    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) return;

    const sr = Math.max(1.2, 4.5 - mag * 0.8);
    const brightness = Math.max(0.3, 1 - mag * 0.15);

    _projectedStars.push({
      x, y, r: Math.max(sr, 8),
      name: name || `Star ${idx + 1}`,
      idx,
      baseSize: sr,
      baseBrightness: brightness,
      twinkleSpeed: 0.8 + Math.random() * 2.5,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  });
}

// ── Animation loop ───────────────────────────────────────────
function startSkyAnimation() {
  if (_skyAnimFrame) return;
  function loop() {
    _skyTime += 0.016; // ~60fps
    _slowRotation += 0.0002; // very slow sky rotation
    updateShootingStars();
    drawSky();
    _skyAnimFrame = requestAnimationFrame(loop);
  }
  _skyAnimFrame = requestAnimationFrame(loop);
}

function stopSkyAnimation() {
  if (_skyAnimFrame) { cancelAnimationFrame(_skyAnimFrame); _skyAnimFrame = null; }
  stopSkySong();
}

// ── Shooting stars ───────────────────────────────────────────
function updateShootingStars() {
  // Randomly spawn a shooting star (more frequent now)
  if (Math.random() < 0.012 && _shootingStars.length < 3) {
    const W = _skyW, H = _skyH;
    const startX = Math.random() * W * 0.8 + W * 0.1;
    const startY = Math.random() * H * 0.3;
    const angle = Math.PI * 0.15 + Math.random() * 0.3;
    const speed = 4 + Math.random() * 4;
    _shootingStars.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.01,
      length: 30 + Math.random() * 40
    });
  }
  // Update existing
  _shootingStars = _shootingStars.filter(s => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= s.decay;
    return s.life > 0;
  });
}

function drawShootingStars(ctx) {
  _shootingStars.forEach(s => {
    const tailX = s.x - s.vx * s.length / 5;
    const tailY = s.y - s.vy * s.length / 5;
    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0, `rgba(255,255,255,0)`);
    grad.addColorStop(1, `rgba(255,255,255,${s.life * 0.8})`);
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Head glow
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.life})`;
    ctx.fill();
  });
}

function _sizeSkyCanvas() {
  const wrap = _skyCanvas.parentElement;
  const w = wrap.clientWidth;
  const h = Math.min(w * 0.9, window.innerHeight * 0.85);
  const dpr = window.devicePixelRatio || 1;
  _skyCanvas.width  = w * dpr;
  _skyCanvas.height = h * dpr;
  _skyCanvas.style.width  = w + 'px';
  _skyCanvas.style.height = h + 'px';
  _skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  _skyW = w;
  _skyH = h;
}

// ── Draw everything (called every frame for animation) ───────
function drawSky() {
  const ctx = _skyCtx;
  const W = _skyW, H = _skyH;
  if (!ctx || !W) return;

  // ── Background gradient (dark night sky) ───────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0e1a');
  grad.addColorStop(0.5, '#0d1526');
  grad.addColorStop(1, '#111a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Moon (waxing gibbous on June 26, 2026) — animated ──────
  // Moon slowly drifts in a gentle arc across the sky
  const moonDriftX = Math.sin(_skyTime * 0.05) * W * 0.03;
  const moonDriftY = Math.cos(_skyTime * 0.03) * H * 0.02;
  _moonX = W * 0.75 + moonDriftX;
  _moonY = H * 0.25 + moonDriftY;
  _moonR = Math.min(W, H) * 0.04;
  const moonX = _moonX, moonY = _moonY, moonR = _moonR;
  // Moon glow (brighter when music is playing)
  const glowIntensity = _skySongPlaying ? 0.5 : 0.3;
  const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 4);
  moonGlow.addColorStop(0, `rgba(255,250,230,${glowIntensity})`);
  moonGlow.addColorStop(0.3, `rgba(255,245,210,${glowIntensity * 0.5})`);
  moonGlow.addColorStop(0.6, `rgba(255,240,200,${glowIntensity * 0.17})`);
  moonGlow.addColorStop(1, 'rgba(255,235,190,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 4, 0, Math.PI * 2);
  ctx.fill();

  // Extra pink glow when music plays
  if (_skySongPlaying) {
    const pulseGlow = ctx.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 5);
    pulseGlow.addColorStop(0, 'rgba(232,165,152,0.2)');
    pulseGlow.addColorStop(0.5, 'rgba(232,165,152,0.08)');
    pulseGlow.addColorStop(1, 'rgba(232,165,152,0)');
    ctx.fillStyle = pulseGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon body
  ctx.fillStyle = '#fff8e7';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();
  // Waxing gibbous shadow (about 70% illuminated, shadow on left side)
  ctx.fillStyle = 'rgba(20,25,40,0.85)';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, Math.PI * 0.5, Math.PI * 1.5);
  ctx.ellipse(moonX - moonR * 0.3, moonY, moonR * 0.4, moonR, 0, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.fill();
  // Moon craters (subtle)
  ctx.fillStyle = 'rgba(200,195,175,0.3)';
  ctx.beginPath(); ctx.arc(moonX + moonR * 0.3, moonY - moonR * 0.2, moonR * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + moonR * 0.1, moonY + moonR * 0.35, moonR * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(moonX + moonR * 0.5, moonY + moonR * 0.1, moonR * 0.1, 0, Math.PI * 2); ctx.fill();

  // ── Music particles (fly from moon to player when playing) ──
  if (_skySongPlaying) {
    // Spawn new particles - burst out from moon
    if (Math.random() < 0.4) {
      const angle = Math.random() * Math.PI * 2; // all directions
      const speed = 2 + Math.random() * 3; // burst outward
      _musicParticles.push({
        x: moonX,
        y: moonY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // initial burst
        life: 1,
        decay: 0.004 + Math.random() * 0.004,
        size: 2 + Math.random() * 3,
        color: '255,255,255', // white stars
        twinkle: Math.random() * Math.PI * 2,
        phase: 0 // 0 = burst out, 1 = float to player
      });
    }
    // Update and draw particles
    _musicParticles = _musicParticles.filter(p => {
      // Get player position (below canvas)
      const wrap = document.getElementById('sky-song-wrap');
      const targetY = wrap ? _skyH + 30 : _skyH + 20; // target near player
      const targetX = _skyW / 2; // center of canvas
      
      if (p.phase === 0) {
        // Phase 0: Burst outward from moon
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95; // slow down burst
        p.vy *= 0.95;
        // Switch to float phase when slowed down
        if (Math.abs(p.vx) < 0.5 && Math.abs(p.vy) < 0.5) {
          p.phase = 1;
          p.angle = Math.atan2(p.y - targetY, p.x - targetX); // initial angle
        }
      } else if (p.phase === 1) {
        // Phase 1: Float toward music player
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 60) {
          // Attract to player
          p.vx += (dx / dist) * 0.15;
          p.vy += (dy / dist) * 0.15;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Close to player - start orbiting
          p.phase = 2;
          p.orbitRadius = dist;
          p.orbitSpeed = 0.05 + Math.random() * 0.03; // rotation speed
          p.orbitDirection = Math.random() > 0.5 ? 1 : -1; // clockwise or counter-clockwise
        }
      } else if (p.phase === 2) {
        // Phase 2: Orbit around the music player
        p.angle += p.orbitSpeed * p.orbitDirection;
        p.orbitRadius *= 0.995; // slowly spiral inward
        
        p.x = targetX + Math.cos(p.angle) * p.orbitRadius;
        p.y = targetY + Math.sin(p.angle) * p.orbitRadius * 0.5; // flatten orbit (ellipse)
        
        // Remove if too close to center or too old
        if (p.orbitRadius < 10) {
          p.life -= 0.02; // fade out when close
        }
      }
      
      p.life -= p.decay;
      p.twinkle += 0.1;
      if (p.life <= 0 || p.y > _skyH + 100) return false;
      
      const twinkleSize = 1 + Math.sin(p.twinkle) * 0.3;
      const currentSize = p.size * p.life * twinkleSize;
      
      // Draw star shape
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.twinkle * 0.5);
      
      // Star glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize * 4);
      glow.addColorStop(0, `rgba(${p.color},${p.life * 0.4})`);
      glow.addColorStop(0.5, `rgba(${p.color},${p.life * 0.15})`);
      glow.addColorStop(1, `rgba(${p.color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Star core (4-point star)
      ctx.fillStyle = `rgba(${p.color},${p.life * 0.9})`;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const outerX = Math.cos(a) * currentSize;
        const outerY = Math.sin(a) * currentSize;
        const innerX = Math.cos(a + Math.PI / 4) * currentSize * 0.4;
        const innerY = Math.sin(a + Math.PI / 4) * currentSize * 0.4;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      
      // Bright center
      ctx.fillStyle = `rgba(255,255,255,${p.life * 0.8})`;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      return true;
    });
  } else {
    _musicParticles = [];
  }

  // ── Background dust stars (twinkling) ──────────────────────
  _bgDustStars.forEach(s => {
    const twinkle = Math.sin(_skyTime * s.twinkleSpeed + s.twinkleOffset);
    const alpha = s.baseAlpha + twinkle * s.baseAlpha * 0.6;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,210,255,${Math.max(0.02, alpha)})`;
    ctx.fill();
  });

  // ── Catalogue stars (twinkling) ────────────────────────────
  _projectedStars.forEach(star => {
    const twinkle = Math.sin(_skyTime * star.twinkleSpeed + star.twinkleOffset);
    const brightness = star.baseBrightness + twinkle * star.baseBrightness * 0.3;
    const size = star.baseSize + twinkle * star.baseSize * 0.15;
    const x = star.x;
    const y = star.y;

    // Glow (pulsing)
    const glowR = size * 3.5;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    glow.addColorStop(0, `rgba(220,230,255,${brightness * 0.5})`);
    glow.addColorStop(0.5, `rgba(180,200,255,${brightness * 0.15})`);
    glow.addColorStop(1, 'rgba(220,230,255,0)');
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Star dot
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, brightness)})`;
    ctx.fill();

    // Cross flare on bright stars
    if (star.baseBrightness > 0.7) {
      const flareLen = size * 4;
      const flareAlpha = brightness * 0.2;
      ctx.strokeStyle = `rgba(220,230,255,${flareAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(x - flareLen, y); ctx.lineTo(x + flareLen, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - flareLen); ctx.lineTo(x, y + flareLen); ctx.stroke();
    }

    // Note indicator (small heart)
    if (_skyNotes[star.idx]) {
      ctx.fillStyle = '#e8a598';
      ctx.font = '10px sans-serif';
      ctx.fillText('♥', x + size + 2, y - size - 2);
    }
  });

  // ── Constellation lines ────────────────────────────────────
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = 'rgba(120,150,200,0.2)';

  CONSTELLATIONS.forEach(([cName, lines]) => {
    const pts = lines.map(([raH, decDeg]) => {
      const raDeg = raH * 15;
      const jd  = julianDate(SKY_CONFIG.date.year, SKY_CONFIG.date.month, SKY_CONFIG.date.day, 22);
      const lst_ = lst(jd, SKY_CONFIG.lon);
      const { alt, az } = equatorialToHorizontal(raDeg, decDeg, lst_, SKY_CONFIG.lat);
      if (alt <= 0) return null;
      const r = (1 - alt / 90) * Math.min(W, H) * 0.45;
      const azRad = (az - 180) * Math.PI / 180;
      return { x: W/2 + r * Math.sin(azRad), y: H/2 - r * Math.cos(azRad) };
    });

    ctx.beginPath();
    let started = false;
    pts.forEach(p => {
      if (!p) { started = false; return; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  });

  // ── Shooting stars ─────────────────────────────────────────
  drawShootingStars(ctx);

  // ── Horizon glow ───────────────────────────────────────────
  const horizonGrad = ctx.createRadialGradient(W/2, H, 0, W/2, H, H * 0.6);
  horizonGrad.addColorStop(0, 'rgba(40,60,100,0.15)');
  horizonGrad.addColorStop(1, 'rgba(40,60,100,0)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Title overlay ──────────────────────────────────────────
  ctx.font = 'italic 16px "EB Garamond", serif';
  ctx.fillStyle = 'rgba(200,210,230,0.5)';
  ctx.fillText('Pagadian City · June 26, 2026 · 10:00 PM', 16, H - 16);

  // ── Compass labels ─────────────────────────────────────────
  ctx.font = '11px "Be Vietnam Pro", sans-serif';
  ctx.fillStyle = 'rgba(160,180,220,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('N', W/2, 18);
  ctx.fillText('S', W/2, H - 4);
  ctx.fillText('E', 14, H/2);
  ctx.fillText('W', W - 14, H/2);
  ctx.textAlign = 'start';
}

// ── Click handler — find nearest star or moon ─────────────────
function onSkyCanvasClick(e) {
  const rect = _skyCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Check if moon was clicked (larger click area)
  const moonDist = Math.hypot(_moonX - mx, _moonY - my);
  if (moonDist < _moonR * 2.5) {
    toggleSkySong();
    return;
  }

  // Find closest star within click radius
  let closest = null;
  let minDist = 20; // max click distance in px
  _projectedStars.forEach(s => {
    const d = Math.hypot(s.x - mx, s.y - my);
    if (d < minDist) { minDist = d; closest = s; }
  });

  if (!closest) { closeSkyNoteTooltip(); return; }

  const note = _skyNotes[closest.idx];
  if (note) {
    // Show tooltip with existing note
    _activeNoteStar = closest.idx;
    const tooltip = document.getElementById('sky-note-tooltip');
    const starNameEl = document.getElementById('sky-note-star-name');
    const noteTextEl = document.getElementById('sky-note-text');
    starNameEl.textContent = closest.name;
    noteTextEl.textContent = note;
    // Position tooltip near the star
    const wrap = _skyCanvas.parentElement.getBoundingClientRect();
    let tx = closest.x + 16;
    let ty = closest.y - 20;
    if (tx + 260 > wrap.width) tx = closest.x - 270;
    if (ty < 10) ty = 10;
    tooltip.style.left = tx + 'px';
    tooltip.style.top  = ty + 'px';
    tooltip.classList.remove('hidden');
  } else {
    // Open add-note modal
    openSkyNoteModal(closest.idx, closest.name);
  }
}

// ── Note modal helpers ───────────────────────────────────────
function openSkyNoteModal(starIdx, starName) {
  _editingStarIdx = starIdx;
  const modal = document.getElementById('sky-note-modal');
  const titleEl = document.getElementById('sky-note-modal-title');
  const starEl  = document.getElementById('sky-note-modal-star');
  const input   = document.getElementById('sky-note-input');
  titleEl.textContent = _skyNotes[starIdx] ? 'Edit Note' : 'Add a Note';
  starEl.textContent  = starName;
  input.value = _skyNotes[starIdx] || '';
  modal.classList.remove('hidden');
  setTimeout(() => input.focus(), 100);
}

function cancelSkyNote() {
  document.getElementById('sky-note-modal').classList.add('hidden');
  _editingStarIdx = null;
}

async function saveSkyNote() {
  if (_editingStarIdx === null) return;
  const input = document.getElementById('sky-note-input');
  const text  = input.value.trim();
  if (text) {
    _skyNotes[_editingStarIdx] = text;
  } else {
    delete _skyNotes[_editingStarIdx];
  }
  await saveSkyNotes();
  document.getElementById('sky-note-modal').classList.add('hidden');
  closeSkyNoteTooltip();
  _editingStarIdx = null;
  drawSky();
}

function closeSkyNoteTooltip() {
  const tooltip = document.getElementById('sky-note-tooltip');
  if (tooltip) tooltip.classList.add('hidden');
  _activeNoteStar = null;
}

function editSkyNote() {
  if (_activeNoteStar === null) return;
  const star = _projectedStars.find(s => s.idx === _activeNoteStar);
  if (!star) return;
  closeSkyNoteTooltip();
  openSkyNoteModal(star.idx, star.name);
}

async function deleteSkyNote() {
  if (_activeNoteStar === null) return;
  delete _skyNotes[_activeNoteStar];
  await saveSkyNotes();
  closeSkyNoteTooltip();
  drawSky();
}

// ── Download as PNG ──────────────────────────────────────────
function downloadSkyPNG() {
  if (!_skyCanvas) return;

  // Create a temporary canvas with caption baked in
  const tmp = document.createElement('canvas');
  const pad = 60;
  const captionH = 80;
  tmp.width  = _skyCanvas.width;
  tmp.height = _skyCanvas.height + captionH * (window.devicePixelRatio || 1);
  const tctx = tmp.getContext('2d');
  const dpr  = window.devicePixelRatio || 1;
  tctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Draw the sky
  tctx.drawImage(_skyCanvas, 0, 0, _skyW, _skyH);

  // Caption bar
  const capY = _skyH + 10;
  tctx.fillStyle = '#0d1526';
  tctx.fillRect(0, _skyH, _skyW, captionH);

  tctx.font = 'italic 18px "EB Garamond", serif';
  tctx.fillStyle = 'rgba(200,210,230,0.8)';
  tctx.textAlign = 'center';
  tctx.fillText('June 26, 2026 · Where our story began', _skyW / 2, capY + 28);

  tctx.font = '12px "Be Vietnam Pro", sans-serif';
  tctx.fillStyle = 'rgba(160,180,220,0.5)';
  tctx.fillText('Pagadian City, Philippines · 7.8278° N, 123.4367° E', _skyW / 2, capY + 52);
  tctx.textAlign = 'start';

  // Trigger download
  const link = document.createElement('a');
  link.download = 'our-sky-june-26-2026.png';
  link.href = tmp.toDataURL('image/png');
  link.click();
}

// ═══════════════════════════════════════════════════════════════
// OUR SKY — Song Player (moon click shows small player)
// ═══════════════════════════════════════════════════════════════

function toggleSkySong() {
  const wrap = document.getElementById('sky-song-wrap');
  const iframe = document.getElementById('sky-song-iframe');
  if (!wrap || !iframe) return;

  if (!_skySongPlaying) {
    // Show player and start playing (Spotify)
    iframe.src = 'https://open.spotify.com/embed/track/1dB1kzLOjTcmSHttRd8bnV?autoplay=1';
    wrap.classList.remove('hidden');
    _skySongPlaying = true;
  } else {
    // Hide player and stop
    iframe.src = '';
    wrap.classList.add('hidden');
    _skySongPlaying = false;
  }
}

function stopSkySong() {
  const wrap = document.getElementById('sky-song-wrap');
  const iframe = document.getElementById('sky-song-iframe');
  if (iframe) iframe.src = '';
  if (wrap) wrap.classList.add('hidden');
  _skySongPlaying = false;
}
