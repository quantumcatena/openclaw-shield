# Publier sur GitHub — Guide rapide

## Option A — Script automatique (recommandé)

```bash
unzip openclaw-shield-repo.zip
cd openclaw-shield
bash setup-github.sh
```

Le script fait tout : init git, crée le repo public, pousse le code, active GitHub Pages.

---

## Option B — Manuellement (interface GitHub)

### Étape 1 — Créer le repo

1. Aller sur https://github.com/new
2. Repository name : **openclaw-shield**
3. Description : `🦞🛡️ Protection en temps réel de votre agent IA Openclaw. Powered by QuantumCatena Sentinel.`
4. Visibilité : **Public**
5. Cliquer **Create repository**

### Étape 2 — Pousser le code

```bash
unzip openclaw-shield-repo.zip
cd openclaw-shield

git init
git add .
git commit -m "feat: Openclaw Shield — dashboard de protection IA grand public"
git branch -M main
git remote add origin https://github.com/quantumcatena/openclaw-shield.git
git push -u origin main
```

### Étape 3 — Activer GitHub Pages

1. Aller dans **Settings** → **Pages**
2. Source : **GitHub Actions**
3. Le dashboard sera live sur :  
   👉 `https://quantumcatena.github.io/openclaw-shield/`

---

## Résultat attendu

```
https://github.com/quantumcatena/openclaw-shield
└── README bien formaté avec badges
└── Dashboard live sur GitHub Pages
└── Connexion au backend Sentinel documentée
```

---

## Lier les deux repos

Dans ton repo `sentinel`, ajoute dans le README :

```markdown
## Interface grand public

👉 [Openclaw Shield](https://github.com/quantumcatena/openclaw-shield) — 
Dashboard de protection IA pour les utilisateurs Openclaw.
```
