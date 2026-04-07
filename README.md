# 🦞🛡️ Openclaw Shield

**Protection en temps réel de votre agent IA Openclaw — pour tout le monde.**

> Propulsé par [QuantumCatena Sentinel](https://github.com/quantumcatena/sentinel) — la couche de sécurité post-quantique pour agents IA.

---

## Aperçu

Openclaw Shield est l'interface grand public de **QuantumCatena Sentinel**. Là où Sentinel s'adresse aux équipes techniques et entreprises (supply chain, finance, cybersécurité), **Openclaw Shield rend la protection IA accessible à n'importe qui** utilisant un agent [Openclaw](https://github.com/openclaw/openclaw).

**En une phrase** : chaque action de votre agent IA est interceptée, évaluée, et vous est présentée de façon claire — avant qu'il ne soit trop tard.

---

## Fonctionnement

```
Votre agent Openclaw
        ↓
  Openclaw Shield  ←── Intercept chaque action
        ↓
  Score de risque  ←── De 0.0 (sûr) à 1.0 (critique)
        ↓
  AUTORISÉ / À VÉRIFIER / BLOQUÉ
        ↓
  Preuve cryptographique
  (traçabilité immuable)
```

---

## Ce que vous voyez dans le dashboard

| Élément | Description |
|---|---|
| **Score de risque** | Jauge visuelle : Faible / Modéré / Critique |
| **Fil d'activité** | Toutes les actions de votre agent en temps réel |
| **Détail par action** | Cliquez n'importe quelle ligne pour voir le score, la décision, et la preuve |
| **Règles actives** | Données perso., transactions, contacts inconnus, exécution de code |
| **Paramètres** | Mode strict, alertes, preuve cryptographique |

---

## Installation rapide

### Option 1 — Frontend seul (mode démo)

```bash
git clone https://github.com/quantumcatena/openclaw-shield.git
cd openclaw-shield
# Ouvrez simplement public/index.html dans votre navigateur
open public/index.html
```

Le dashboard fonctionne immédiatement en **mode démo** avec des données simulées.

### Option 2 — Connecté au backend Sentinel (mode live)

```bash
# 1. Lancez le backend Sentinel (depuis le repo QuantumCatena Sentinel)
git clone https://github.com/quantumcatena/sentinel.git
cd sentinel
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# 2. Dans Openclaw Shield, éditez public/app.js :
# Ligne 12 : SENTINEL_API: "http://localhost:8000"

# 3. Ouvrez public/index.html
```

---

## Connexion à votre agent Openclaw

Ajoutez Sentinel comme middleware dans votre agent Openclaw. Chaque action est soumise à `/v1/intercept` avant exécution :

```python
import requests

def sentinel_check(action_type: str, target: str, payload: dict) -> dict:
    """
    Soumet une action à Sentinel avant de l'exécuter.
    Retourne la décision : allow / review / block
    """
    response = requests.post("http://localhost:8000/v1/intercept", json={
        "agent_id": "openclaw-user-agent",
        "action_type": action_type,
        "target": target,
        "payload": payload,
        "context": {"environment": "user", "initiated_by": "openclaw"}
    })
    return response.json()

# Exemple : avant d'envoyer un email
decision = sentinel_check("send_data", "smtp://mail.example.com", {
    "recipient": "contact@example.com",
    "data_class": "general"
})

if decision["decision"] == "block":
    print(f"🚫 Action bloquée : {decision['reasoning']}")
elif decision["decision"] == "review":
    print(f"⚠️ Action à vérifier — score : {decision['risk_score']}")
else:
    # Procéder à l'action
    send_email(...)
```

---

## Règles de protection par défaut

| Règle | Déclencheur | Décision |
|---|---|---|
| 🔒 Données personnelles | PII vers serveur externe | 🚫 BLOQUÉ |
| 💸 Transferts importants | Montant ≥ seuil configuré | 🚫 BLOQUÉ |
| ⚠️ Contacts inconnus | Destinataire non reconnu | 🔍 À VÉRIFIER |
| 🛡️ Exécution de code | Script non approuvé | 🚫 BLOQUÉ |

---

## Architecture

```
openclaw-shield/
├── public/
│   ├── index.html      # Dashboard principal
│   ├── style.css       # Design system
│   └── app.js          # Logique : démo + connexion API Sentinel
├── docs/
│   └── integration.md  # Guide d'intégration complet
└── README.md
```

---

## Stack technique

- **Frontend** : HTML/CSS/JS vanilla — zéro dépendance, 100% navigateur
- **Backend** : [QuantumCatena Sentinel](https://github.com/quantumcatena/sentinel) (FastAPI + Python)
- **Cryptographie** : Ed25519 (démo) → Dilithium-3 NIST FIPS 204 (production)
- **Audit** : SQLite append-only avec chaînage de hachages

---

## Différences Sentinel Pro vs Openclaw Shield

| | Sentinel (pro) | Openclaw Shield (grand public) |
|---|---|---|
| **Public** | Développeurs, équipes SOC | Tout utilisateur Openclaw |
| **Interface** | API REST + Swagger | Dashboard visuel simple |
| **Terminologie** | ActionPayload, SentinelDecision | "Vos actions", "Autorisé / Bloqué" |
| **Règles** | Configuration YAML avancée | 4 règles simples avec toggles |
| **Preuve PQC** | Base64 brut | Affiché proprement sur clic |
| **Déploiement** | Docker / serveur | Ouvrir `index.html` |

---

## Roadmap

- [x] Dashboard frontend (démo + live)
- [x] Connexion API Sentinel
- [ ] Notifications navigateur (Web Push)
- [ ] Page d'onboarding "premier lancement"
- [ ] Intégration Openclaw native (plugin)
- [ ] Application mobile (PWA)
- [ ] Rapport hebdomadaire des actions

---

## À propos

**Openclaw Shield** est développé par [Joffrey Catena](https://quantumcatena.io) — QuantumCatena.  
Docteur en sciences juridiques et techniques informatiques.

- Site : [quantumcatena.io](https://quantumcatena.io)
- Email : contact@quantumcatena.io
- Backend Sentinel : [github.com/quantumcatena/sentinel](https://github.com/quantumcatena/sentinel)

---

## Licence

MIT — libre d'utilisation, de modification et de distribution.
