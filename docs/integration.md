# Guide d'intégration — Openclaw Shield × Sentinel

## Connexion au backend Sentinel

### 1. Configurer l'URL de l'API

Éditez `public/app.js`, ligne 12 :

```javascript
const CONFIG = {
  SENTINEL_API: "http://localhost:8000", // Votre URL Sentinel
  POLL_INTERVAL_MS: 5000,               // Fréquence de mise à jour (ms)
};
```

### 2. Endpoints utilisés par le dashboard

| Endpoint | Usage |
|---|---|
| `GET /v1/stats` | Statistiques globales (allowed/review/blocked) |
| `GET /v1/audit/recent?limit=10` | Dernières actions pour le fil d'activité |
| `POST /v1/intercept` | Soumettre une action depuis votre agent |
| `POST /v1/verify-proof` | Vérifier une preuve cryptographique |

### 3. Format de réponse attendu

```json
// GET /v1/stats
{
  "total_allowed": 47,
  "total_review": 3,
  "total_blocked": 2,
  "block_rate": 0.038
}

// GET /v1/audit/recent
{
  "entries": [
    {
      "action_type": "send_data",
      "target": "api.example.com",
      "decision": "block",
      "risk_score": 0.94,
      "pqc_proof": "base64...",
      "action_hash": "sha256...",
      "timestamp": "2025-04-07T10:30:00Z",
      "reasoning": "Matched policies: [block-pii-external-transfer]"
    }
  ]
}
```

## Intégration dans un agent Openclaw

### Python (exemple minimal)

```python
import requests
import json

SENTINEL_URL = "http://localhost:8000"

def before_action(action_type: str, target: str, payload: dict = None):
    """Décorateur de sécurité à appeler avant toute action de l'agent."""
    try:
        resp = requests.post(
            f"{SENTINEL_URL}/v1/intercept",
            json={
                "agent_id": "openclaw-personal",
                "action_type": action_type,
                "target": target,
                "payload": payload or {},
                "context": {
                    "environment": "user",
                    "initiated_by": "openclaw-shell"
                }
            },
            timeout=2.0
        )
        result = resp.json()

        if result["decision"] == "block":
            raise PermissionError(
                f"Action bloquée (risque {result['risk_score']:.2f}) : {result['reasoning']}"
            )
        elif result["decision"] == "review":
            print(f"⚠️  Action à risque modéré ({result['risk_score']:.2f}) — procédez avec prudence")

        return result

    except requests.exceptions.ConnectionError:
        # Sentinel non disponible : laisser passer (fail-open)
        # En production, préférez fail-closed selon votre politique
        print("⚠️  Sentinel non disponible — action non vérifiée")
        return {"decision": "allow", "risk_score": 0}


# Exemples d'utilisation
before_action("read_data",  "local-filesystem", {"path": "/home/user/docs"})
before_action("call_api",   "https://api.openai.com/v1/chat", {"model": "gpt-4"})
before_action("send_data",  "smtp://mail.gmail.com", {"recipient": "boss@company.com"})
```

### Avec décorateur Python

```python
import functools

def sentinel_guard(action_type: str):
    """Décorateur qui intercepte une fonction avant son exécution."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            target = kwargs.get("target") or (args[0] if args else "unknown")
            payload = kwargs.get("payload") or {}
            before_action(action_type, str(target), payload)
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Usage
@sentinel_guard("send_data")
def send_email(target, payload=None):
    # Cette fonction est automatiquement protégée
    ...
```

## Déploiement en production

### Docker Compose (Sentinel + Shield)

```yaml
version: '3.8'
services:
  sentinel:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - ./sentinel:/app
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"

  shield:
    image: nginx:alpine
    volumes:
      - ./openclaw-shield/public:/usr/share/nginx/html
    ports:
      - "3000:80"
    depends_on:
      - sentinel
```

### Variables d'environnement Sentinel

```bash
# Passer en cryptographie Dilithium-3 (production)
export PQC_BACKEND=dilithium3
pip install liboqs-python
```

## Sécurité

- En mode production, sécurisez l'API Sentinel avec JWT (prévu dans v1.0)
- Ne jamais exposer `/v1/audit` publiquement sans authentification
- Utilisez HTTPS en production (reverse proxy nginx/caddy)
- La preuve PQC permet de vérifier l'intégrité de chaque décision de façon indépendante
