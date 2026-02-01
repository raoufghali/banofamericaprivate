// script.js

const USERS = {
  'Dolly': 'tylerluvdolly112',
  'Dianne': 'tylerluvdianne112',
  'Zera': 'tylerluvzera112',
  // new test accounts (for testing only)
  'Petrina': 'anthonyluvpetrina',
  'Tanisha': 'anthonyluvtanisha',
  'Dennis': 'anthonyluvdennis',
  'Wendy': 'anthonyluvwendy',
  'Donna': 'sephluvdonna'
};

const $ = id => document.getElementById(id);
const overlay = $('overlay');

const showOverlay = (show = true) => {
  if (!overlay) return;
  overlay.classList.toggle('hidden', !show);
  overlay.setAttribute('aria-hidden', String(!show));
};

// show screen immediately
const show = id => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  // ensure overlay hidden
  showOverlay(false);
};

// show screen after a delay (used for small-loading effects)
const showWithDelay = (id, ms = 2000) => {
  showOverlay(true);
  setTimeout(() => {
    show(id);
  }, ms);
};

// SVG icons for eye and eye-off
const EYE_SVG = `<svg width="20" height="14" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 8s3.5-5 11-5 11 5 11 5-3.5 5-11 5S1 8 1 8zm11 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="#666"/></svg>`;
const EYE_OFF_SVG = `<svg width="20" height="14" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 2l20 12M1 8s3.5-5 11-5c2.06 0 3.96.47 5.58 1.24L1 14.24S-0 9 1 8zM12 3a5 5 0 0 1 5 5c0 1.2-.43 2.3-1.14 3.17L8.83 4.14A4.98 4.98 0 0 1 12 3z" stroke="#666" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// password toggle
let pwdVisible = false;
const togglePwd = $('toggle-pwd');
if (togglePwd) {
  // set initial icon
  togglePwd.innerHTML = EYE_SVG;
  togglePwd.addEventListener('click', () => {
    pwdVisible = !pwdVisible;
    const input = $('login-password');
    if (input) input.type = pwdVisible ? 'text' : 'password';
    togglePwd.classList.toggle('off', !pwdVisible);
    togglePwd.setAttribute('aria-pressed', String(pwdVisible));
    togglePwd.innerHTML = pwdVisible ? EYE_OFF_SVG : EYE_SVG;
  });
}

// handle login (with 5s spinner when successful)
const btnLogin = $('btn-login');
if (btnLogin) btnLogin.addEventListener('click', () => {
  const inputRaw = $('login-username') ? $('login-username').value.trim() : '';
  const password = $('login-password') ? $('login-password').value : '';
  const msg = $('login-msg');
  if (msg) msg.textContent = '';

  // case-insensitive username lookup while preserving display name
  const matchedKey = Object.keys(USERS).find(k => k.toLowerCase() === inputRaw.toLowerCase());

  if (matchedKey && USERS[matchedKey] === password) {
    // show spinner overlay for 5s then show dashboard
    showOverlay(true);

    // set the personalized fields immediately so overlay hides after delay and shows personalized content
    const userName = $('user-name');
    if (userName) userName.textContent = matchedKey;
    const welcomeName = $('welcome-name');
    if (welcomeName) welcomeName.textContent = matchedKey;

    const inboxNote = $('inbox-note');
    if (inboxNote) inboxNote.textContent = `You have 1 new message — Welcome back, ${matchedKey}.`;

    setTimeout(() => {
      show('dashboard');
      // hide overlay
      showOverlay(false);
    }, 5000);
  } else {
    if (msg) msg.textContent = 'Incorrect User ID or Password';
  }
});

// logout clears fields + names
const btnLogout = $('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', () => {
  show('login');
  const loginUsername = $('login-username');
  if (loginUsername) loginUsername.value = '';
  const loginPassword = $('login-password');
  if (loginPassword) loginPassword.value = '';

  const userName = $('user-name');
  if (userName) userName.textContent = '';
  const welcomeName = $('welcome-name');
  if (welcomeName) welcomeName.textContent = '';
  const inboxNote = $('inbox-note');
  if (inboxNote) inboxNote.textContent = 'You have 1 new message.';
});

// small delayed navigation for menu & bottom nav items
const delayedTargets = {
  'menu-accounts': ['dashboard', 2000],
  'menu-transfer': ['transfer', 2000],
  'menu-zelle': ['zelle', 2000],
  'menu-bill': ['bills', 2000],
  'menu-deposit': ['deposit', 2000],
  'menu-invest': ['invest', 2000],
  'nav-transfer': ['transfer', 2000],
  'nav-bill': ['bills', 2000],
  'nav-deposit': ['deposit', 2000],
  'nav-invest': ['invest', 2000]
};

Object.keys(delayedTargets).forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const [screenId, delay] = delayedTargets[id];
    showWithDelay(screenId, delay);
    // update active state for bottom nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el.classList.contains('nav-item')) el.classList.add('active');
  });
});

// menu tap
const menuTap = $('menu-tap');
if (menuTap) menuTap.addEventListener('click', () => showWithDelay('menu-screen', 200));

// back buttons
const backMenu = $('back-menu');
if (backMenu) backMenu.addEventListener('click', () => show('dashboard'));

const inboxTap = $('inbox-tap');
if (inboxTap) inboxTap.addEventListener('click', () => showWithDelay('inbox', 2000));

const backInbox = $('back-inbox');
if (backInbox) backInbox.addEventListener('click', () => show('dashboard'));

const backTrans = $('back-trans');
if (backTrans) backTrans.addEventListener('click', () => show('dashboard'));

// Account VIEW button behaviour (single row / no history for investments)
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.view-btn');
  if (!btn) return;
  const accountName = btn.getAttribute('data-account') || '';
  openTransactionsFor(accountName);
});

// deterministic mapping for single-row transactions
function openTransactionsFor(accountName) {
  // quick overlay while building content
  showOverlay(true);

  setTimeout(() => {
    const title = $('transactions-title');
    if (title) title.textContent = `${accountName} Transactions`;

    const body = $('transactions-body');
    if (!body) return;

    body.innerHTML = '';

    // Map known accounts to single transaction lines (date default is Jan 26, 2026)
    const mapping = {
      'Advantage Plus Checking -6682': { date: 'January 26, 2026', desc: 'Deposit', amount: '$40,120.00' },
      'Advantage Savings -6705': { date: 'January 26, 2026', desc: 'Deposit', amount: '$50,030.00' },
      'Customized Cash Rewards -4028': { date: 'January 26, 2026', desc: 'Deposit', amount: '$135.00' },
      'Unlimited Cash Rewards -7439': { date: 'January 26, 2026', desc: 'Deposit', amount: '$60.00' },
      'Unlimited Inv Balance -6223': null, // investment - no history
      'Reward on Investment -5544': null    // investment - no history
    };

    // find exact mapping or fallback: try to match suffix if exact not found
    const key = Object.keys(mapping).find(k => k === accountName) || Object.keys(mapping).find(k => accountName.includes(k.split(' -')[0]));

    // determine current logged-in user (for Wendy date override)
    const currentUser = ($('user-name') && $('user-name').textContent) ? $('user-name').textContent.trim() : '';
    const isWendy = currentUser.toLowerCase() === 'wendy';

    if (key && mapping[key]) {
      // base row info
      const row = mapping[key];
      // override date for Wendy
      const dateToShow = isWendy ? 'February 1, 2026' : row.date;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${dateToShow}</td><td>${row.desc}</td><td>${row.amount}</td>`;
      body.appendChild(tr);
    } else {
      // investments or unknown -> show "No Transaction History"
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="3" style="text-align:center;color:#666;padding:1rem">No Transaction History</td>`;
      body.appendChild(tr);
    }

    show('account-transactions');
    showOverlay(false);
  }, 300); // small delay for responsiveness
}

// make sure checking/savings cards respond to full click (open their respective transactions)
const checkingCard = $('checking-card');
if (checkingCard) checkingCard.addEventListener('click', () => openTransactionsFor('Advantage Plus Checking -6682'));
const savingsCard = $('savings-card');
if (savingsCard) savingsCard.addEventListener('click', () => openTransactionsFor('Advantage Savings -6705'));

// Back handlers for other screens
const backChecking = $('back-checking');
if (backChecking) backChecking.addEventListener('click', () => show('dashboard'));
const backSavings = $('back-savings');
if (backSavings) backSavings.addEventListener('click', () => show('dashboard'));
const backZelle = $('back-zelle');
if (backZelle) backZelle.addEventListener('click', () => show('dashboard'));
const backTransfer = $('back-transfer');
if (backTransfer) backTransfer.addEventListener('click', () => show('dashboard'));
const backDeposit = $('back-deposit');
if (backDeposit) backDeposit.addEventListener('click', () => show('dashboard'));
const backBills = $('back-bills');
if (backBills) backBills.addEventListener('click', () => show('dashboard'));
const backInvest = $('back-invest');
if (backInvest) backInvest.addEventListener('click', () => show('dashboard'));

// small accessibility: allow Enter to submit on login
const usernameInput = $('login-username');
if (usernameInput) {
  usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnLogin.click();
    }
  });
}
const passwordInput = $('login-password');
if (passwordInput) {
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnLogin.click();
    }
  });
}
