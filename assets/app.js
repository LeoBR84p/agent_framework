/**
 * AIz Intel - Proprietary Agentic Framework
 * app.js — Shared JavaScript: Auth, Nav, Dark Mode, Search, Completeness
 * Version: 1.0.0
 *
 * Usage: included at the bottom of every HTML file.
 * Requires: window.FIREBASE_CONFIG set in the page's <head> <script> block.
 * Optional: window.SEARCH_INDEX array for search indexing.
 * Optional: window.PAGE_REQUIRED_SECTIONS array for completeness scoring.
 */

/* ============================================================
   1. FIREBASE INITIALIZATION
   ============================================================ */

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb  = null;

async function initFirebase() {
  if (!window.FIREBASE_CONFIG) {
    console.warn('[AIz] window.FIREBASE_CONFIG not set. Auth disabled.');
    return;
  }
  try {
    // Dynamically import Firebase SDK (ESM via CDN, or bundled)
    if (typeof firebase !== 'undefined') {
      // Legacy compat SDK
      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      firebaseAuth = firebase.auth();
      firebaseDb   = firebase.firestore();
    } else {
      // Modular SDK via CDN (v9+)
      const { initializeApp }              = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      firebaseApp  = initializeApp(window.FIREBASE_CONFIG);
      firebaseAuth = getAuth(firebaseApp);
      firebaseDb   = getFirestore(firebaseApp);

      // Expose helpers on window for use in page-level scripts
      window._fb = { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, doc, getDoc };
    }
    initAuthObserver();
  } catch (err) {
    console.error('[AIz] Firebase init failed:', err);
  }
}

/* ============================================================
   2. AUTH STATE OBSERVER
   ============================================================ */

const PUBLIC_PATHS = ['auth.html', '/auth.html', 'auth', 'investor/index.html'];

function isPublicPage() {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(p => path.endsWith(p)) ||
         path.startsWith('/investor/') ||
         path === '/' + 'investor';
}

function initAuthObserver() {
  if (isPublicPage()) return; // Do not guard public/investor pages

  const redirectToAuth = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = '/auth.html?return=' + returnUrl;
  };

  if (window._fb) {
    // Modular SDK path
    window._fb.onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        redirectToAuth();
        return;
      }
      const allowed = await checkEmailAllowlist(user.email);
      if (!allowed) {
        showAccessDenied(user.email);
      } else {
        updateNavUser(user);
      }
    });
  } else if (firebaseAuth) {
    // Compat SDK path
    firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        redirectToAuth();
        return;
      }
      const allowed = await checkEmailAllowlist(user.email);
      if (!allowed) {
        showAccessDenied(user.email);
      } else {
        updateNavUser(user);
      }
    });
  }
}

async function checkEmailAllowlist(email) {
  if (!firebaseDb || !email) return false;
  try {
    let docSnap;
    if (window._fb) {
      const { doc, getDoc } = window._fb;
      docSnap = await getDoc(doc(firebaseDb, 'allowedUsers', email));
    } else {
      docSnap = await firebaseDb.collection('allowedUsers').doc(email).get();
    }
    return docSnap.exists;
  } catch (err) {
    console.error('[AIz] Allowlist check failed:', err);
    return false;
  }
}

function showAccessDenied(email) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);">
      <div style="text-align:center;padding:3rem;background:var(--card);border:1px solid var(--border);border-radius:1rem;max-width:400px;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
        <h2 style="color:var(--text-primary);margin-bottom:0.5rem;">Access Denied</h2>
        <p style="color:var(--text-secondary);margin-bottom:1.5rem;">
          <strong>${email}</strong> is not on the access list for this project.
          Contact the project owner to request access.
        </p>
        <button class="btn btn-secondary" onclick="signOutUser()">Sign out</button>
      </div>
    </div>`;
}

function updateNavUser(user) {
  const nameEl = document.getElementById('nav-user-name');
  const emailEl = document.getElementById('nav-user-email');
  if (nameEl)  nameEl.textContent  = user.displayName || 'User';
  if (emailEl) emailEl.textContent = user.email || '';
}

/* ============================================================
   3. SIGN IN / SIGN OUT
   ============================================================ */

async function signInWithGoogle() {
  const errorEl = document.getElementById('auth-error');
  try {
    if (window._fb) {
      const { GoogleAuthProvider, signInWithPopup } = window._fb;
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(firebaseAuth, provider);
      const user     = result.user;
      const allowed  = await checkEmailAllowlist(user.email);
      if (!allowed) {
        if (errorEl) {
          errorEl.textContent = `${user.email} is not authorized for this project.`;
          errorEl.classList.add('visible');
        }
        await signOutUser();
        return;
      }
      const params  = new URLSearchParams(window.location.search);
      const returnUrl = params.get('return') || '/index.html';
      window.location.href = returnUrl;
    } else if (firebaseAuth) {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result   = await firebaseAuth.signInWithPopup(provider);
      const user     = result.user;
      const allowed  = await checkEmailAllowlist(user.email);
      if (!allowed) {
        if (errorEl) {
          errorEl.textContent = `${user.email} is not authorized for this project.`;
          errorEl.classList.add('visible');
        }
        await firebaseAuth.signOut();
        return;
      }
      const params  = new URLSearchParams(window.location.search);
      const returnUrl = params.get('return') || '/index.html';
      window.location.href = returnUrl;
    }
  } catch (err) {
    console.error('[AIz] Sign in failed:', err);
    if (errorEl) {
      errorEl.textContent = 'Sign-in failed. Please try again.';
      errorEl.classList.add('visible');
    }
  }
}

async function signOutUser() {
  try {
    if (window._fb) {
      const { signOut } = window._fb;
      await signOut(firebaseAuth);
    } else if (firebaseAuth) {
      await firebaseAuth.signOut();
    }
  } catch (err) {
    console.error('[AIz] Sign out failed:', err);
  }
  window.location.href = '/auth.html';
}

// Expose globally
window.signInWithGoogle = signInWithGoogle;
window.signOutUser      = signOutUser;

/* ============================================================
   4. DARK / LIGHT MODE TOGGLE
   ============================================================ */

const THEME_KEY = 'aiz-theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light-mode');
    document.body.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
    document.body.classList.remove('light-mode');
  }
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggleLabel(theme);
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function updateThemeToggleLabel(theme) {
  const toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(el => {
    const icon = el.querySelector('.toggle-icon');
    const text = el.querySelector('.toggle-text');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (text) text.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  });
}

window.toggleTheme = toggleTheme;

/* ============================================================
   5. SIDEBAR TOGGLE (MOBILE)
   ============================================================ */

function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const overlay   = document.getElementById('sidebar-overlay');

  if (!sidebar) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('visible');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }

  // Close sidebar when a nav link is clicked on mobile
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
      }
    });
  });
}

/* ============================================================
   6. ACTIVE NAV LINK DETECTION
   ============================================================ */

function initActiveNav() {
  const current = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && current.endsWith(href.replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   7. SIDEBAR NAV RENDERER
   ============================================================ */

const NAV_STRUCTURE = [
  {
    label: 'Overview',
    links: [
      { icon: '🏠', text: 'Dashboard',       href: '/index.html' },
      { icon: '🔍', text: 'Search',           href: '/search.html' },
      { icon: '✅', text: 'Setup Checklist',  href: '/setup_checklist.html' },
    ]
  },
  {
    label: 'Business',
    division: 'business',
    links: [
      { icon: '💡', text: 'Idea',              href: '/business/idea.html' },
      { icon: '📋', text: 'Business Plan',     href: '/business/business_plan.html' },
      { icon: '📊', text: 'Economics',         href: '/business/economics.html' },
      { icon: '💰', text: 'Pricing',           href: '/business/pricing.html' },
      { icon: '🏆', text: 'Competitor Analysis', href: '/business/competitor_analysis.html' },
      { icon: '🚀', text: 'Launch Plan',       href: '/business/launch_plan.html' },
      { icon: '📣', text: 'Marketing',         href: '/business/marketing.html' },
      { icon: '⚠️', text: 'Risk',              href: '/business/risk.html' },
    ]
  },
  {
    label: 'Technology',
    division: 'technology',
    links: [
      { icon: '🔧', text: 'Tech Plan',         href: '/technology/tech_plan.html' },
      { icon: '🦸', text: 'Zero to Hero',      href: '/technology/zero_hero.html' },
      { icon: '🗄️', text: 'DB Schema',         href: '/technology/db_schema.html' },
      { icon: '🔍', text: 'Code Review',        href: '/technology/code_review.html' },
      { icon: '🛡️', text: 'Disaster Recovery', href: '/technology/disaster_recovery.html' },
      { icon: '🗺️', text: 'Roadmap',           href: '/technology/roadmap.html' },
    ]
  },
  {
    label: 'Brand',
    division: 'brand',
    links: [
      { icon: '🎨', text: 'Brand Guidelines',  href: '/brand/brand_guidelines.html' },
    ]
  },
  {
    label: 'Operations',
    division: 'operations',
    links: [
      { icon: '💸', text: 'Cost Tracking',     href: '/operations/cost_tracking.html' },
      { icon: '🧾', text: 'Operational Costs', href: '/operations/operational_costs.html' },
      { icon: '🎯', text: 'OKR / KPI',         href: '/operations/okr_kpi.html' },
      { icon: '🎧', text: 'Customer Support',  href: '/operations/customer_support.html' },
      { icon: '🧠', text: 'Customer Memory',   href: '/operations/customer_memory.html' },
      { icon: '📄', text: 'Terms of Service',  href: '/operations/terms_of_service.html' },
      { icon: '🔒', text: 'Privacy Policy',    href: '/operations/privacy_policy.html' },
      { icon: '🍪', text: 'Cookie Policy',     href: '/operations/cookie_policy.html' },
      { icon: '📑', text: 'DPA & SLA',         href: '/operations/dpa_sla.html' },
    ]
  },
  {
    label: 'Investor Relations',
    division: 'investor-relations',
    links: [
      { icon: '📈', text: 'Pitch Deck',        href: '/investor-relations/pitch.html' },
      { icon: '🤝', text: 'Investor Memory',   href: '/investor-relations/investor_memory.html' },
    ]
  }
];

function renderNav() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const logoHtml = sidebar.querySelector('.nav-logo') ? sidebar.querySelector('.nav-logo').outerHTML : `
    <div class="nav-logo">
      <img id="project-logo" src="/assets/logo.svg" alt="Project Logo" class="nav-logo-img">
      <span class="nav-project-name" id="nav-project-name">PROJECT_NAME</span>
    </div>`;

  let sectionsHtml = '';
  NAV_STRUCTURE.forEach(section => {
    const linksHtml = section.links.map(link =>
      `<a class="nav-link" href="${link.href}">
        <span class="nav-icon">${link.icon}</span>
        <span>${link.text}</span>
      </a>`
    ).join('');

    sectionsHtml += `
      <div class="nav-section">
        <div class="nav-section-label">${section.label}</div>
        ${linksHtml}
      </div>`;
  });

  const footerHtml = `
    <div class="nav-footer">
      <div style="font-size:var(--text-xs);color:var(--text-muted);padding:0 var(--space-3);margin-bottom:var(--space-1);">
        <span id="nav-user-name"></span>
      </div>
      <button class="theme-toggle" onclick="toggleTheme()">
        <span class="toggle-icon">☀️</span>
        <span class="toggle-text">Light mode</span>
      </button>
      <button class="logout-btn" onclick="signOutUser()">
        <span>🚪</span>
        <span>Sign out</span>
      </button>
    </div>`;

  sidebar.innerHTML = logoHtml + sectionsHtml + footerHtml;

  // Load project name from config
  loadProjectConfig();
  initActiveNav();
}

async function loadProjectConfig() {
  try {
    const res  = await fetch('/project_config.json');
    const data = await res.json();
    const name = data?.project?.name || 'PROJECT_NAME';
    const nameEl = document.getElementById('nav-project-name');
    if (nameEl) nameEl.textContent = name;

    // Update page title project name references
    document.querySelectorAll('.project-name-placeholder').forEach(el => {
      el.textContent = name;
    });

    // Update logo if custom
    const logo = data?.project?.logo;
    if (logo) {
      document.querySelectorAll('#project-logo').forEach(img => {
        img.src = logo;
      });
    }

    // Load external links if on dashboard
    if (data?.project?.externalLinks) {
      renderExternalLinks(data.project.externalLinks);
    }
  } catch (e) {
    // Config not available, use defaults
  }
}

/* ============================================================
   8. EXTERNAL LINKS
   ============================================================ */

const LINK_META = {
  github:    { icon: '🐙', label: 'GitHub'   },
  figma:     { icon: '🎨', label: 'Figma'    },
  notion:    { icon: '📝', label: 'Notion'   },
  analytics: { icon: '📊', label: 'Analytics'},
  stripe:    { icon: '💳', label: 'Stripe'   },
  vercel:    { icon: '▲',  label: 'Vercel'   },
};

function renderExternalLinks(links) {
  const container = document.getElementById('external-links-container');
  if (!container) return;
  const items = Object.entries(links)
    .filter(([, url]) => url)
    .map(([key, url]) => {
      const meta = LINK_META[key] || { icon: '🔗', label: key };
      return `<a class="external-link" href="${url}" target="_blank" rel="noopener">
        <span class="external-link-icon">${meta.icon}</span>
        <span>${meta.label}</span>
      </a>`;
    }).join('');
  container.innerHTML = items || '<span style="color:var(--text-muted);font-size:var(--text-sm)">No external links configured.</span>';
}

/* ============================================================
   9. METRICS LOADER (DASHBOARD)
   ============================================================ */

async function loadMetrics() {
  const container = document.getElementById('metrics-container');
  if (!container) return;
  try {
    const res  = await fetch('/metrics.json');
    const data = await res.json();
    renderMetrics(data, container);
  } catch (e) {
    container.innerHTML = '<p class="text-muted text-sm">Metrics not available.</p>';
  }
}

function renderMetrics(data, container) {
  const metrics = [
    { label: 'MRR',          value: data.mrr          != null ? formatCurrency(data.mrr)          : '—', delta: data.mrr_delta },
    { label: 'Runway',       value: data.runway_months != null ? data.runway_months + 'mo'         : '—', delta: null },
    { label: 'Active Users', value: data.active_users  != null ? formatNumber(data.active_users)   : '—', delta: data.active_users_delta },
    { label: 'Sprint',       value: data.sprint_status || '—', delta: null },
    { label: 'ARR',          value: data.arr           != null ? formatCurrency(data.arr)           : '—', delta: data.arr_delta },
    { label: 'CAC',          value: data.cac           != null ? formatCurrency(data.cac)           : '—', delta: null },
    { label: 'LTV',          value: data.ltv           != null ? formatCurrency(data.ltv)           : '—', delta: null },
    { label: 'Churn',        value: data.churn_rate    != null ? data.churn_rate + '%'              : '—', delta: null },
  ];

  container.innerHTML = metrics.map(m => `
    <div class="metric-card">
      <div class="metric-label">${m.label}</div>
      <div class="metric-value">${m.value}</div>
      ${m.delta != null ? `<div class="metric-delta ${m.delta >= 0 ? 'positive' : 'negative'}">${m.delta >= 0 ? '↑' : '↓'} ${Math.abs(m.delta)}%</div>` : ''}
    </div>`
  ).join('');
}

function formatCurrency(val) {
  if (val >= 1_000_000) return '$' + (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000)     return '$' + (val / 1_000).toFixed(1) + 'K';
  return '$' + val;
}

function formatNumber(val) {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000)     return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ============================================================
   10. COMPLETENESS SCORE CALCULATOR
   ============================================================ */

function initCompletenessScore() {
  const fillPattern = /<!--\s*FILL[^>]*-->/gi;

  // Count FILL comments in current document
  const html = document.documentElement.outerHTML;
  const fills = (html.match(fillPattern) || []).length;

  // Count required sections that have actual content
  const sections = window.PAGE_REQUIRED_SECTIONS || [];
  let filled = 0;
  sections.forEach(sectionId => {
    const el = document.getElementById(sectionId);
    if (el) {
      const innerHtml = el.innerHTML;
      const hasFill   = fillPattern.test(innerHtml);
      fillPattern.lastIndex = 0;
      if (!hasFill && innerHtml.trim().length > 50) filled++;
    }
  });

  const total   = sections.length || 1;
  const pct     = Math.round((filled / total) * 100);
  const scoreEl = document.getElementById('completeness-score');
  const fillEl  = document.getElementById('completeness-fill');

  if (scoreEl) scoreEl.textContent = pct + '%';
  if (fillEl)  fillEl.style.width  = pct + '%';

  // Render required sections checklist
  const listEl = document.getElementById('required-sections-list');
  if (listEl && sections.length > 0) {
    listEl.innerHTML = sections.map(id => {
      const el      = document.getElementById(id);
      const isFilled = el && !fillPattern.test(el.innerHTML) && el.innerHTML.trim().length > 50;
      fillPattern.lastIndex = 0;
      const label   = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<li>
        <span class="section-check ${isFilled ? 'filled' : 'empty'}">${isFilled ? '✓' : ''}</span>
        <a href="#${id}" style="color:var(--text-secondary);font-size:var(--text-sm);">${label}</a>
      </li>`;
    }).join('');
  }
}

/* ============================================================
   11. STATUS BADGE COLOR CODING
   ============================================================ */

function initStatusBadges() {
  document.querySelectorAll('.status-badge').forEach(badge => {
    // Already handled by CSS data-status attribute
    const status = badge.dataset.status || badge.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    badge.setAttribute('data-status', status);
  });
}

/* ============================================================
   12. GLOBAL SEARCH
   ============================================================ */

// Search index is built from each page's window.SEARCH_INDEX definition.
// search.html collects this from a pre-built static file or the global registry.

const SEARCH_REGISTRY_KEY = 'aiz-search-index';

function registerSearchEntry(entry) {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SEARCH_REGISTRY_KEY) || '[]');
    existing.push(entry);
    sessionStorage.setItem(SEARCH_REGISTRY_KEY, JSON.stringify(existing));
  } catch (e) { /* ignore */ }
}

function initSearchPage() {
  const inputEl   = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  if (!inputEl || !resultsEl) return;

  // Load the static search index
  fetch('/search-index.json')
    .then(r => r.json())
    .then(index => {
      window._searchIndex = index;
    })
    .catch(() => {
      // Fallback: use window.SEARCH_INDEX if defined
      window._searchIndex = window.SEARCH_INDEX || [];
    });

  inputEl.addEventListener('input', () => {
    const query = inputEl.value.trim().toLowerCase();
    if (query.length < 2) {
      resultsEl.innerHTML = '';
      return;
    }
    performSearch(query, resultsEl);
  });

  // Auto-focus
  inputEl.focus();

  // Handle URL query param
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    inputEl.value = q;
    setTimeout(() => performSearch(q.toLowerCase(), resultsEl), 300);
  }
}

function performSearch(query, resultsEl) {
  const index = window._searchIndex || [];
  if (!index.length) {
    resultsEl.innerHTML = `<p class="search-empty">Search index not loaded. Try again in a moment.</p>`;
    return;
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  const results = index.filter(entry => {
    const haystack = [
      entry.title,
      entry.division,
      entry.description || '',
      (entry.keywords || []).join(' ')
    ].join(' ').toLowerCase();
    return tokens.every(t => haystack.includes(t));
  });

  if (!results.length) {
    resultsEl.innerHTML = `<div class="search-empty">
      <div style="font-size:2rem;margin-bottom:1rem;">🔍</div>
      <p>No results for "<strong>${escapeHtml(query)}</strong>"</p>
    </div>`;
    return;
  }

  resultsEl.innerHTML = results.map(r => `
    <a class="search-result" href="${r.path}">
      <div class="search-result-division">${r.division}</div>
      <div class="search-result-title">${highlight(r.title, query)}</div>
      <div class="search-result-excerpt">${highlight(r.description || r.keywords?.join(', ') || '', query)}</div>
    </a>`
  ).join('');
}

function highlight(text, query) {
  const safe   = escapeHtml(text);
  const tokens = query.split(/\s+/).filter(Boolean);
  let   result = safe;
  tokens.forEach(t => {
    const re = new RegExp(`(${escapeRegex(t)})`, 'gi');
    result = result.replace(re, '<mark style="background:var(--brand-glow);color:var(--brand-primary);border-radius:2px;">$1</mark>');
  });
  return result;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================================
   13. CHANGELOG ROW INSERTION HELPER
   ============================================================ */

/**
 * Inserts a new changelog entry into the changelog table.
 * @param {Object} entry - { date, version, author, change }
 */
function addChangelogEntry(entry) {
  const tbody = document.querySelector('.changelog-table tbody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${entry.date || new Date().toISOString().slice(0,10)}</td>
    <td>${entry.version || 'v0.1'}</td>
    <td>${entry.author || ''}</td>
    <td>${entry.change || ''}</td>`;
  tbody.insertBefore(row, tbody.firstChild);
}

window.addChangelogEntry = addChangelogEntry;

/* ============================================================
   14. SETUP CHECKLIST PROGRESS
   ============================================================ */

function initSetupChecklist() {
  const progressFill  = document.getElementById('setup-progress-fill');
  const progressLabel = document.getElementById('setup-progress-label');
  const checkboxes    = document.querySelectorAll('.setup-check');

  if (!checkboxes.length) return;

  // Restore state from localStorage
  checkboxes.forEach(cb => {
    const saved = localStorage.getItem('aiz-setup-' + cb.id);
    if (saved === 'true') {
      cb.checked = true;
      cb.closest('.checklist-item')?.classList.add('done');
    }
    cb.addEventListener('change', () => {
      localStorage.setItem('aiz-setup-' + cb.id, cb.checked);
      cb.closest('.checklist-item')?.classList.toggle('done', cb.checked);
      updateSetupProgress();
    });
  });

  updateSetupProgress();

  function updateSetupProgress() {
    const total   = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const pct     = Math.round((checked / total) * 100);
    if (progressFill)  progressFill.style.width  = pct + '%';
    if (progressLabel) progressLabel.textContent = `${checked} / ${total} complete (${pct}%)`;
  }
}

/* ============================================================
   15. INVESTOR NDA GATE
   ============================================================ */

function initNdaGate(projectId) {
  const key    = 'aiz-nda-' + (projectId || 'default');
  const gate   = document.getElementById('nda-gate');
  const content= document.getElementById('investor-content');
  const checkbox = document.getElementById('nda-checkbox');
  const btn    = document.getElementById('nda-accept-btn');

  if (!gate || !content) return;

  const accepted = localStorage.getItem(key) === 'true';
  if (accepted) {
    gate.style.display    = 'none';
    content.style.display = 'block';
    return;
  }

  gate.style.display    = 'flex';
  content.style.display = 'none';

  if (btn) {
    btn.addEventListener('click', () => {
      if (checkbox && !checkbox.checked) {
        checkbox.style.outline = '2px solid var(--error)';
        return;
      }
      localStorage.setItem(key, 'true');
      gate.style.display    = 'none';
      content.style.display = 'block';
    });
  }
}

function resetNdaGate(projectId) {
  const key = 'aiz-nda-' + (projectId || 'default');
  localStorage.removeItem(key);
  window.location.reload();
}

window.initNdaGate   = initNdaGate;
window.resetNdaGate  = resetNdaGate;

/* ============================================================
   16. INITIALIZE EVERYTHING ON DOM READY
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme
  initTheme();

  // 2. Render sidebar nav (unless page has its own nav structure)
  if (document.querySelector('.sidebar') && !document.querySelector('.sidebar').dataset.manual) {
    renderNav();
  }

  // 3. Sidebar toggle
  initSidebar();

  // 4. Firebase (async, non-blocking for page content)
  initFirebase();

  // 5. Status badges
  initStatusBadges();

  // 6. Completeness score
  if (window.PAGE_REQUIRED_SECTIONS) {
    setTimeout(initCompletenessScore, 100);
  }

  // 7. Search page
  initSearchPage();

  // 8. Setup checklist
  initSetupChecklist();

  // 9. Dashboard metrics
  loadMetrics();
});
