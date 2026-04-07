#!/bin/bash
# ============================================================
# setup-github.sh — Openclaw Shield
# Crée le repo GitHub et pousse le code en une commande
# Usage : bash setup-github.sh
# ============================================================

set -e

REPO_NAME="openclaw-shield"
GITHUB_USER="quantumcatena"
GITHUB_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}"

echo ""
echo "🛡️  Openclaw Shield — Publication GitHub"
echo "========================================="
echo ""

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
  echo "📦 Installation de GitHub CLI..."
  # macOS
  if command -v brew &> /dev/null; then
    brew install gh
  # Ubuntu/Debian
  elif command -v apt &> /dev/null; then
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update && sudo apt install gh -y
  else
    echo "❌ Installez GitHub CLI manuellement : https://cli.github.com/"
    exit 1
  fi
fi

# Authentification
echo "🔐 Connexion GitHub..."
gh auth status 2>/dev/null || gh auth login

# Init git
echo ""
echo "📁 Initialisation du repo local..."
git init
git add .
git commit -m "feat: Openclaw Shield — dashboard de protection IA grand public

- Dashboard visuel complet (zéro dépendance)
- Mode démo + connexion live backend Sentinel
- Score de risque, fil d'activité, preuves PQC
- Déploiement GitHub Pages automatique (Actions)

Powered by QuantumCatena Sentinel
https://github.com/quantumcatena/sentinel"

# Créer le repo GitHub
echo ""
echo "🚀 Création du repo GitHub..."
gh repo create "${REPO_NAME}" \
  --public \
  --description "🦞🛡️ Protection en temps réel de votre agent IA Openclaw — pour tout le monde. Powered by QuantumCatena Sentinel." \
  --source=. \
  --remote=origin \
  --push

# Activer GitHub Pages
echo ""
echo "🌐 Activation GitHub Pages..."
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/${GITHUB_USER}/${REPO_NAME}/pages \
  -f source='{"branch":"main","path":"/public"}' \
  2>/dev/null || echo "⚠️  GitHub Pages : activez manuellement dans Settings → Pages → Source: GitHub Actions"

echo ""
echo "✅ Terminé !"
echo ""
echo "   Repo    : ${GITHUB_URL}"
echo "   Pages   : https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo ""
echo "📋 Prochaine étape pour GitHub Pages automatique :"
echo "   Settings → Pages → Source → GitHub Actions"
echo ""
