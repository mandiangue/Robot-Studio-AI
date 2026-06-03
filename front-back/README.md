# 🤖 RoboTest Studio — Guide de démarrage

## Présentation

RoboTest Studio est un agent IA de génération et d'exécution de tests Robot Framework. Il permet de générer des cas de tests, du code RF en architecture POM, et de lancer les tests directement depuis l'interface.

---

## Stack technique

- **Frontend** : `index.html` + `qa-agent.js` (interface principale), `dashboard.html` (historique)
- **Backend** : `server.js` (Node.js/Express)
- **Base de données** : MongoDB Atlas
- **Tests** : Robot Framework + SeleniumLibrary

---

## Prérequis

- Node.js v18+
- Python 3.x avec `pip install robotframework robotframework-seleniumlibrary`
- ChromeDriver compatible avec ta version de Chrome
- Un compte MongoDB Atlas

---

## Installation

```bash
git clone <repo>
cd front-back
npm install
```

---

## Configuration `.env`

Crée un fichier `.env` à la racine :

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/robotstudio
PORT=3001
ENCRYPTION_SECRET=<généré par encrypt_all_keys.js>
ANTHROPIC_KEY_ENC=<généré par encrypt_all_keys.js>
OPENAI_KEY_ENC=<généré par encrypt_all_keys.js>
GEMINI_KEY_ENC=<généré par encrypt_all_keys.js>
MISTRAL_KEY_ENC=<généré par encrypt_all_keys.js>
```

---

## Chiffrement des clés API

Les clés API sont stockées **chiffrées en AES-256** dans `.env`. Le script `encrypt_all_keys.js` génère toutes les valeurs avec un seul secret partagé.

### Étape 1 — Lancer le script interactif

```bash
node encrypt_all_keys.js
```

Il te demande les 4 clés une par une :

```
Clé ANTHROPIC (Enter pour ignorer): sk-ant-...
  ✓ ANTHROPIC chiffré (enc length: 224)
Clé OPENAI (Enter pour ignorer): sk-proj-...
  ✓ OPENAI chiffré (enc length: 352)
Clé GEMINI (Enter pour ignorer): AIzaSy...
  ✓ GEMINI chiffré (enc length: 96)
Clé MISTRAL (Enter pour ignorer): ...
  ✓ MISTRAL chiffré (enc length: 96)
```

### Étape 2 — Copier les lignes générées dans `.env`

Le script affiche 5 lignes à copier **exactement** dans `.env` :

```
ENCRYPTION_SECRET=a1b2c3d4...
ANTHROPIC_KEY_ENC=iv_hex:encrypted_hex
OPENAI_KEY_ENC=iv_hex:encrypted_hex
GEMINI_KEY_ENC=iv_hex:encrypted_hex
MISTRAL_KEY_ENC=iv_hex:encrypted_hex
```

⚠️ **Important** :
- Chaque valeur doit être sur **une seule ligne** dans `.env`
- Ne commite jamais `.env` dans git
- Si tu régénères les clés, utilise le même `ENCRYPTION_SECRET` pour tous les providers

### Vérification

```bash
node -e "require('dotenv').config(); const e=process.env.ANTHROPIC_KEY_ENC; const p=e.split(':'); console.log('iv:', p[0].length, 'enc:', p[1]?.length);"
```

Les deux longueurs doivent être **paires** (ex: iv: 32, enc: 224).

---

## Démarrage

```bash
node server.js
```

Ouvre `http://localhost:3001`

---

## Fonctionnalités

### 🧪 Génération de tests
- Décris tes tests en langage naturel
- L'agent génère des cas de tests structurés
- Génère le code Robot Framework en architecture POM multi-fichiers

### ▶️ Exécution
- Lance un run simple depuis le bloc de code
- Lance une suite de tests séquentielle
- Mode headless ou avec navigateur visible

### 📊 Dashboard
- Historique de tous les runs (runs simples + suites)
- Statistiques : taux de réussite, durée moyenne, KPIs
- Charts par type et par date

### 🔴 Live Panel
- Visualisation en temps réel du flow d'exécution
- Timeline avec ronds colorés : ✓ vert (pass), ✗ rouge (fail), ⏭ orange (skip)
- Traits entre les tests selon les résultats
- Sections séparées : Runs simples / Suites

### 🔄 Sync VS Code ↔ UI
- Modifications dans l'UI → écrites sur disque immédiatement
- Modifications dans VS Code → mises à jour dans l'UI via SSE
- Les fichiers modifiés manuellement ne sont pas écrasés par le run (protection 30 min)

### 🗄️ Persistance MongoDB
- Tous les blocs de code, rapports et cas de tests sont stockés en MongoDB
- Fallback localStorage si le serveur n'est pas disponible
- Reset complet depuis l'UI (vide MongoDB + localStorage)

---

## Structure des collections MongoDB

| Collection | Contenu |
|---|---|
| `codecards` | Blocs de code RF et rapports |
| `reports` | Rapports de runs simples |
| `suitereports` | Rapports de suites |
| `tcstores` | Cas de tests (document unique storeId: main) |
| `suites` | Suites sauvegardées + registry |

---

## Providers IA supportés

| Provider | Modèles |
|---|---|
| **Anthropic** | Claude Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6, Haiku 4.5 |
| **OpenAI** | GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, GPT-4o, GPT-4o Mini |
| **Gemini** | Gemini 3.1 Pro Preview, 3 Flash Preview, 2.5 Pro, 2.5 Flash, 2.0 Flash |
| **Mistral** | Mistral Large 3, Small 4, Medium, Nemo |

---

## Architecture des fichiers RF générés

```
rf_tests/
├── resources/
│   ├── variables.robot      # Variables globales
│   ├── keywords.robot       # Keywords métier
│   └── pages/
│       └── main_page.robot  # Page Object
├── tests/
│   └── tests.robot          # Cas de tests
└── suite_runs/
    └── suite_<id>_<n>/      # Répertoires isolés par bloc de suite
```

---

## Dépannage

**Le champ API key ne s'affiche plus**
Les clés sont chargées depuis `.env`. Si une clé n'est pas configurée, le champ réapparaît automatiquement.

**Tests failed — mauvaise URL**
Après un reset, regénère les blocs de code RF. Les snapshots automatiques de `variables.robot` sont désactivés.

**Le registry de suite est vide après reload**
```javascript
cleanSuiteRegistry()
```

**enc length impair lors du chiffrement**
Utilise `encrypt_all_keys.js` (mode interactif) plutôt que `setup_encryption_all.js`.
