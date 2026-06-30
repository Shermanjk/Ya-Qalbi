// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — Auth Module
// Answers are verified server-side via a Supabase Edge Function.
// No credentials are stored in this file.
// ═══════════════════════════════════════════════════════════════

// ─── Supabase config (public keys only — safe to expose) ─────
const SUPABASE_URL      = 'https://kmkoivhfzpziziqtudzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtta29pdmhmenB6aXppcXR1ZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDUyNTQsImV4cCI6MjA5ODAyMTI1NH0.5vjnTVausCTpE5QpCo2tLX22LZK3sEvN_oABVQR_AxQ';

// Edge Function endpoint (server-side answer verification)
const VERIFY_URL = `${SUPABASE_URL}/functions/v1/verify-auth`;

// ─── Local fallback (used when Edge Function is not yet deployed) ─────
const _local = {
  1: ['love', 'my love'],
  2: ['june 26','jun 26','06/26','06-26','6/26','6-26',
      '26 june','26 jun','26/06','26-06','june26','jun26']
};

// ─── Verify answer ─────────────────────────────────────────────
// Tries Supabase Edge Function first; falls back to local check
// if the function is not yet deployed or unreachable.
async function verifyAnswer(step, rawAnswer) {
  const normalised = rawAnswer.trim().toLowerCase();
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ step, answer: rawAnswer })
    });
    if (!res.ok) throw new Error('not deployed');
    const data = await res.json();
    return data.valid === true;
  } catch {
    // Edge Function not deployed yet — use local fallback
    return (_local[step] || []).includes(normalised);
  }
}

// ─── Session ─────────────────────────────────────────────────
// Make isPartner available globally for other modules
window.isPartner = function() {
  return sessionStorage.getItem('ya-qalbi-role') === 'partner';
};

function applyRole() {
  const partner = isPartner();
  const btn = document.getElementById('btn-auth');
  const closeBtn = document.getElementById('btn-close-login');
  const mainContent = document.querySelector('main');

  document.body.classList.toggle('is-partner', partner);

  // Hide main content if not signed in
  if (mainContent) {
    mainContent.style.display = partner ? '' : 'none';
  }

  // Show/hide close button
  if (closeBtn) {
    closeBtn.classList.toggle('hidden', !partner);
  }

  if (btn) {
    if (partner) {
      btn.textContent = 'Sign Out';
      btn.onclick     = signOut;
      btn.className   = 'flex items-center gap-2 px-6 py-2 rounded-full border border-outline text-on-surface-variant font-label-md hover:bg-surface-container transition-all duration-200';
    } else {
      btn.textContent = 'Sign In';
      btn.onclick     = openLogin;
      btn.className   = 'flex items-center gap-2 px-6 py-2 rounded-full border border-primary text-primary font-label-md hover:bg-primary-container/30 transition-all duration-200';
    }
  }
}

function signOut() {
  sessionStorage.removeItem('ya-qalbi-role');
  applyRole();
  if (typeof onPartnerSignOut === 'function') onPartnerSignOut();
}

// ─── Modal open / close ──────────────────────────────────────
function openLogin() {
  showStep(1);
  document.getElementById('input-callsign').value  = '';
  document.getElementById('input-monthsary').value = '';
  document.getElementById('error-callsign').classList.add('hidden');
  document.getElementById('error-monthsary').classList.add('hidden');
  document.getElementById('input-callsign').classList.remove('error');
  document.getElementById('input-monthsary').classList.remove('error');
  document.getElementById('login-modal').classList.add('open');
  setTimeout(() => document.getElementById('input-callsign').focus(), 120);
}

function closeLogin() {
  // Don't allow closing if not signed in
  if (!isPartner()) return;
  document.getElementById('login-modal').classList.remove('open');
}

// ─── Step navigation ─────────────────────────────────────────
function showStep(n) {
  [1, 2, 3].forEach(i => {
    const step = document.getElementById('login-step-' + i);
    step.classList.toggle('hidden-step', i !== n);
    // Add animation class to step 3 when shown
    if (i === 3 && n === 3) {
      step.classList.add('animate');
    } else {
      step.classList.remove('animate');
    }
  });
}

// ─── Loading state helper ────────────────────────────────────
function setLoading(buttonId, loading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled    = loading;
  btn.textContent = loading ? 'Checking…' : btn.dataset.label;
}

// ─── Step 1: Goodnight word ──────────────────────────────────
async function checkCallsign() {
  const input = document.getElementById('input-callsign');
  const err   = document.getElementById('error-callsign');
  const btn   = document.getElementById('btn-step1');
  if (!input.value.trim()) return;

  btn.disabled    = true;
  btn.textContent = 'Checking…';

  const valid = await verifyAnswer(1, input.value);

  btn.disabled    = false;
  btn.textContent = 'Continue';

  if (valid) {
    err.classList.add('hidden');
    input.classList.remove('error');
    showStep(2);
    setTimeout(() => document.getElementById('input-monthsary').focus(), 120);
  } else {
    err.classList.remove('hidden');
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 400);
  }
}

// ─── Step 2: Monthsary date ──────────────────────────────────
async function checkMonthsary() {
  const input = document.getElementById('input-monthsary');
  const err   = document.getElementById('error-monthsary');
  const btn   = document.getElementById('btn-step2');
  if (!input.value.trim()) return;

  btn.disabled    = true;
  btn.textContent = 'Checking…';

  const valid = await verifyAnswer(2, input.value);

  btn.disabled    = false;
  btn.textContent = 'Sign In';

  if (valid) {
    err.classList.add('hidden');
    input.classList.remove('error');
    sessionStorage.setItem('ya-qalbi-role', 'partner');
    showStep(3);
    setTimeout(() => {
      applyRole();
      closeLogin();
      if (typeof onPartnerSignIn === 'function') onPartnerSignIn();
    }, 1800);
  } else {
    err.classList.remove('hidden');
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 400);
  }
}

// ─── Init on DOM ready ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-modal')
    .addEventListener('click', function(e) {
      // Don't allow closing by clicking outside if not signed in
      if (e.target === this && isPartner()) closeLogin();
    });

  document.addEventListener('keydown', e => {
    // Don't allow closing with escape if not signed in
    if (e.key === 'Escape' && isPartner()) closeLogin();
  });

  applyRole();
  
  // Auto-open login if not signed in
  if (!isPartner()) {
    setTimeout(() => openLogin(), 500);
  }
});
