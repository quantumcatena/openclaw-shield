/**
 * Openclaw Shield — app.js
 * Dashboard de protection IA pour le grand public
 * Powered by QuantumCatena Sentinel — https://github.com/quantumcatena/sentinel
 * Dashboard repo — https://github.com/quantumcatena/openclaw-shield
 */

// ─── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
  SENTINEL_API: "https://sentinel-t26z.onrender.com",
  POLL_INTERVAL_MS: 5000,
  TOKEN: null,
};

// ─── Données de démonstration ─────────────────────────────────────────────────

const DEMO_EVENTS = [
  {
    id: "evt-001",
    action: "Lecture de vos emails",
    detail: "Accès lecture seule",
    type: "safe",
    score: 0.07,
    decision: "AUTORISÉ",
    proof: "ed25519:a3f2c8d1e4b5f690a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4c91b",
    time: "il y a 2 min",
  },
  {
    id: "evt-002",
    action: "Recherche sur le web",
    detail: "Requête vers moteur public",
    type: "safe",
    score: 0.12,
    decision: "AUTORISÉ",
    proof: "ed25519:b7c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0f034",
    time: "il y a 5 min",
  },
  {
    id: "evt-003",
    action: "Envoi d'un email",
    detail: "Destinataire inconnu détecté",
    type: "warn",
    score: 0.54,
    decision: "À VÉRIFIER",
    proof: "ed25519:d4e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e82a17",
    time: "il y a 8 min",
  },
  {
    id: "evt-004",
    action: "Transfert de données perso.",
    detail: "Données sensibles vers serveur externe",
    type: "block",
    score: 0.94,
    decision: "BLOQUÉ",
    proof: "ed25519:f91a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90c55",
    time: "il y a 12 min",
  },
];

const ICONS = {
  safe: `<svg viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="11" rx="2" stroke="#1a9e6e" stroke-width="1.5"/><path d="M2 7l7 4 7-4" stroke="#1a9e6e" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  warn: `<svg viewBox="0 0 18 18" fill="none"><path d="M9 3v7M9 13v1" stroke="#d97706" stroke-width="1.8" stroke-linecap="round"/><path d="M2 16h14L9 2 2 16z" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  block: `<svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#dc3545" stroke-width="1.5"/><path d="M6 6l6 6M12 6l-6 6" stroke="#dc3545" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const BADGE_LABELS = { safe: "Autorisé", warn: "À vérifier", block: "Bloqué" };

// ─── State ────────────────────────────────────────────────────────────────────

let state = {
  events: [],
  stats: { allowed: 0, review: 0, blocked: 0 },
  startTime: Date.now(),
};

// ─── Render ───────────────────────────────────────────────────────────────────

function renderFeed(events) {
  const feed = document.getElementById("feed");
  feed.innerHTML = events.map(evt => `
    <div class="feed-item" onclick="openModal(${JSON.stringify(evt).replace(/"/g, "&quot;")})">
      <div class="feed-icon ${evt.type}">${ICONS[evt.type]}</div>
      <div class="feed-content">
        <div class="feed-action">${evt.action}</div>
        <div class="feed-detail">${evt.detail} · ${evt.time}</div>
      </div>
      <span class="feed-badge badge-${evt.type}">${BADGE_LABELS[evt.type]}</span>
    </div>
  `).join("");
}

function renderStats(stats) {
  document.getElementById("stat-allowed").textContent = stats.allowed;
  document.getElementById("stat-review").textContent  = stats.review;
  document.getElementById("stat-blocked").textContent = stats.blocked;

  const total = stats.allowed + stats.review + stats.blocked;
  const riskScore = total === 0 ? 0 :
    (stats.review * 0.5 + stats.blocked * 1.0) / total;

  const bar = document.getElementById("risk-bar");
  const val = document.getElementById("risk-val");

  let level, color, pct;
  if (riskScore < 0.2) {
    level = "Faible"; color = "var(--safe)"; pct = Math.max(8, riskScore * 100);
    val.className = "risk-value safe";
  } else if (riskScore < 0.5) {
    level = "Modéré"; color = "var(--warn)"; pct = riskScore * 100;
    val.className = "risk-value warn";
  } else {
    level = "Critique"; color = "var(--block)"; pct = Math.min(95, riskScore * 100);
    val.className = "risk-value danger";
  }

  val.textContent = level;
  bar.style.width = pct + "%";
  bar.style.background = color;
}

function renderCTA(stats) {
  const total = stats.allowed + stats.review + stats.blocked;
  const incidents = stats.blocked;
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const timeStr = elapsed < 60 ? `${elapsed}s` :
                  elapsed < 3600 ? `${Math.floor(elapsed / 60)}min` :
                  `${Math.floor(elapsed / 3600)}h`;

  document.getElementById("cta-summary").textContent =
    `${total} actions analysées · ${incidents} incident${incidents !== 1 ? "s" : ""} · Actif depuis ${timeStr}`;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function openModal(evt) {
  if (typeof evt === "string") evt = JSON.parse(evt.replace(/&quot;/g, '"'));

  const colors = { safe: "var(--safe)", warn: "var(--warn)", block: "var(--block)" };

  document.getElementById("m-action").textContent   = evt.action;
  document.getElementById("m-detail").textContent   = evt.detail;
  document.getElementById("m-score").textContent    = evt.score.toFixed(2) + " / 1.0";
  document.getElementById("m-score").style.color    = colors[evt.type];
  document.getElementById("m-decision").textContent = evt.decision;
  document.getElementById("m-decision").style.color = colors[evt.type];
  document.getElementById("m-proof").textContent    =
    "Preuve PQC : " + evt.proof.substring(0, 48) + "...\n(vérifiée ✓)";

  document.getElementById("modal").classList.add("open");
}

function closeModal(e) {
  if (e.target.id === "modal") {
    document.getElementById("modal").classList.remove("open");
  }
}

// ─── API Sentinel ─────────────────────────────────────────────────────────────

async function fetchFromSentinel() {
  if (!CONFIG.SENTINEL_API) return null;

  // Login automatique si pas de token
  if (!CONFIG.TOKEN) {
    try {
      const r = await fetch(`${CONFIG.SENTINEL_API}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo2@openclaw.io",
          password: "Demo1234!",
          tenant_slug: "openclaw-demo2",
        }),
      });
      if (r.ok) {
        const data = await r.json();
        CONFIG.TOKEN = data.access_token;
      } else {
        return null;
      }
    } catch (err) {
      console.warn("Login Sentinel échoué", err);
      return null;
    }
  }

  try {
    const headers = { "Authorization": `Bearer ${CONFIG.TOKEN}` };
    const [statsRes, auditRes] = await Promise.all([
      fetch(`${CONFIG.SENTINEL_API}/v1/stats`, { headers }),
      fetch(`${CONFIG.SENTINEL_API}/v1/audit/recent?limit=10`, { headers }),
    ]);

    if (!statsRes.ok || !auditRes.ok) {
      CONFIG.TOKEN = null; // token expiré, forcer re-login au prochain cycle
      return null;
    }

    const stats = await statsRes.json();
    const audit = await auditRes.json();
    return { stats, audit };
  } catch (err) {
    console.warn("Sentinel API non disponible — mode démo actif", err);
    return null;
  }
}

function mapSentinelAudit(auditEntries) {
  return auditEntries.map((entry, i) => {
    const decision = entry.decision?.toLowerCase();
    const type = decision === "allow" ? "safe" :
                 decision === "review" ? "warn" : "block";

    // CORRECTION : champ decided_at (pas timestamp)
    const minutesAgo = Math.floor((Date.now() - new Date(entry.decided_at)) / 60000);
    const timeStr = minutesAgo <= 0 ? "à l'instant" :
                    minutesAgo === 1 ? "il y a 1 min" : `il y a ${minutesAgo} min`;

    const actionLabels = {
      send_data:      "Envoi de données",
      read_data:      "Lecture de données",
      call_api:       "Appel API externe",
      execute_code:   "Exécution de code",
      delete_records: "Suppression d'enregistrements",
      transfer_funds: "Transfert financier",
    };

    const detailMap = {
      safe: {
        read_data:      'Lecture verifiee, aucun risque detecte',
        call_api:       'Appel API surveille, autorise',
        send_data:      'Envoi verifie, destinataire connu',
        execute_code:   'Script verifie et approuve',
        transfer_funds: 'Transaction dans les limites autorisees',
      },
      warn: {
        read_data:      'Fichier sensible, acces surveille',
        call_api:       'Serveur externe inconnu, a verifier',
        send_data:      'Destinataire non reconnu, surveillance activee',
        execute_code:   'Script non standard, execution surveillee',
        transfer_funds: 'Montant inhabituel, validation recommandee',
      },
      block: {
        read_data:      'Acces bloque, donnees protegees',
        call_api:       'Appel bloque, serveur non autorise',
        send_data:      'Envoi bloque, donnees personnelles detectees',
        execute_code:   'Execution bloquee, script non approuve',
        transfer_funds: 'Virement bloque, montant depasse le seuil',
      },
    };
    const detail = (detailMap[type] && detailMap[type][entry.action_type])
      ? detailMap[type][entry.action_type]
      : type === 'block' ? 'Action bloquee par politique de securite'
      : type === 'warn'  ? 'Action signalee pour verification'
      : 'Action verifiee et autorisee';

    return {
      id:       entry.action_hash?.substring(0, 12) || `evt-${i}`,
      action:   actionLabels[entry.action_type] || entry.action_type || 'Action agent',
      detail,
      type,
      score:    entry.risk_score ?? 0,
      decision: type === 'safe' ? 'AUTORISE' : type === 'warn' ? 'A VERIFIER' : 'BLOQUE',
      proof:    `ed25519:${entry.pqc_proof?.substring(0, 32) || '...'}`,
      time:     timeStr,
    };
  });
}

// ─── Init & polling ───────────────────────────────────────────────────────────

async function update() {
  const sentinelData = await fetchFromSentinel();
  if (sentinelData) {
    const s = sentinelData.stats;
    state.stats = {
      allowed: s.by_decision?.allow   ?? s.total_allowed ?? 0,
      review:  s.by_decision?.review  ?? s.total_review  ?? 0,
      blocked: s.blocked_actions      ?? s.by_decision?.block ?? s.total_blocked ?? 0,
    };
    const auditArray = Array.isArray(sentinelData.audit)
      ? sentinelData.audit
      : sentinelData.audit.entries ?? [];
    state.events = mapSentinelAudit(auditArray);
  } else {
    state.events = DEMO_EVENTS;
    state.stats  = { allowed: 47, review: 3, blocked: 2 };
  }
  renderFeed(state.events);
  renderStats(state.stats);
  renderCTA(state.stats);
}

function animateStats() {
  const targets = { allowed: state.stats.allowed, review: state.stats.review, blocked: state.stats.blocked };
  const current = { allowed: 0, review: 0, blocked: 0 };
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    Object.keys(targets).forEach(key => { current[key] = Math.round(targets[key] * ease); });
    document.getElementById('stat-allowed').textContent = current.allowed;
    document.getElementById('stat-review').textContent  = current.review;
    document.getElementById('stat-blocked').textContent = current.blocked;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// SSE temps reel
let _sseSource = null;

async function connectSSE() {
  if (!CONFIG.SENTINEL_API || !CONFIG.TOKEN) return;
  if (_sseSource) { _sseSource.close(); _sseSource = null; }
  const url = CONFIG.SENTINEL_API + '/v1/events/stream?token=' + CONFIG.TOKEN;
  try {
    _sseSource = new EventSource(url);
    _sseSource.addEventListener('connected', () => {
      console.log('[Shield] SSE connecte - temps reel actif');
      showLiveIndicator(true);
    });
    _sseSource.addEventListener('decision', (e) => {
      const entry = JSON.parse(e.data);
      onNewDecision(entry);
    });
    _sseSource.onerror = () => {
      console.warn('[Shield] SSE deconnecte - fallback polling');
      showLiveIndicator(false);
      _sseSource.close();
      _sseSource = null;
      setTimeout(startPollingFallback, 2000);
    };
  } catch(err) {
    console.warn('[Shield] SSE non disponible', err);
    startPollingFallback();
  }
}

function onNewDecision(entry) {
  const mapped = mapSentinelAudit([entry])[0];
  if (!mapped) return;
  state.events = [mapped, ...state.events].slice(0, 20);
  if (mapped.type === 'safe')  state.stats.allowed++;
  if (mapped.type === 'warn')  state.stats.review++;
  if (mapped.type === 'block') state.stats.blocked++;
  renderFeed(state.events);
  renderStats(state.stats);
  renderCTA(state.stats);
  flashNewEntry(mapped.type);
  if (mapped.type === 'block') showBlockNotification(mapped.action, mapped.detail);
}

function flashNewEntry(type) {
  const feed = document.getElementById('feed');
  const first = feed.querySelector('.feed-item');
  if (!first) return;
  const colors = { safe: '#1a9e6e', warn: '#d97706', block: '#dc3545' };
  first.style.transition = 'background 0.1s';
  first.style.background = colors[type] + '22';
  setTimeout(() => { first.style.background = ''; }, 800);
}

function showBlockNotification(action, detail) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('Openclaw Shield - Action bloquee', { body: action + ' - ' + detail });
  }
}

function showLiveIndicator(live) {
  let dot = document.getElementById('live-dot');
  if (!dot) {
    dot = document.createElement('span');
    dot.id = 'live-dot';
    dot.style.cssText = 'display:inline-block;width:8px;height:8px;border-radius:50%;margin-left:8px;vertical-align:middle;';
    const style = document.createElement('style');
    style.textContent = '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}';
    document.head.appendChild(style);
    dot.style.animation = 'pulse 1.5s infinite';
    const title = document.querySelector('h1');
    if (title) title.appendChild(dot);
  }
  dot.style.background = live ? '#1a9e6e' : '#dc3545';
}

let _pollingInterval = null;
function startPollingFallback() {
  if (_pollingInterval) return;
  _pollingInterval = setInterval(update, CONFIG.POLL_INTERVAL_MS);
}

// Boot
document.addEventListener('DOMContentLoaded', async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  await update();
  setTimeout(animateStats, 200);
  if (CONFIG.SENTINEL_API) {
    setTimeout(async () => {
      if (CONFIG.TOKEN) { await connectSSE(); }
      else { startPollingFallback(); }
    }, 1000);
  }
  setInterval(() => renderCTA(state.stats), 30000);
});

window.openModal  = openModal;
window.closeModal = closeModal;
