# 🤖 RoboTest Studio v1 — Guide de démarrage

## Présentation

RoboTest Studio est un agent IA de génération et d'exécution de tests Robot Framework. Il permet de générer des cas de tests, du code RF en architecture POM, et de lancer les tests directement depuis l'interface.

---

## Stack technique

- **Frontend** : `index.html` + modules JS (`core.js`, `cards.js`, `generation.js`, `prompts.js`, `report.js`, `connectors.js`, `editor.js`, `codecards.js`, …), `dashboard.html` (historique)
- **Backend** : `server.js` (Node.js/Express)
- **Base de données** : MongoDB Atlas
- **Tests** : Robot Framework — SeleniumLibrary (web), Browser/Playwright (web), AppiumLibrary (mobile), RequestsLibrary (API REST), DatabaseLibrary (SQL)

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

Crée un fichier `.env` à la racine `front-back/` :

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/robotstudio
PORT=3001
```

### Clés API — 2 méthodes au choix

Tu n'as besoin de configurer **qu'une seule** méthode par provider. Le serveur essaie d'abord la clé chiffrée (`*_KEY_ENC` + `ENCRYPTION_SECRET`), sinon retombe automatiquement sur la clé en clair (`*_KEY`).

**Méthode 1 — En clair (simple)** — ajoute la clé brute des providers que tu utilises :

```env
ANTHROPIC_KEY=sk-ant-...
OPENAI_KEY=sk-proj-...
GEMINI_KEY=AIzaSy...
MISTRAL_KEY=...
```

**Méthode 2 — Chiffrée AES-256 (recommandé)** — ne stocke pas la clé en clair ; génère les valeurs avec `encrypt_all_keys.js` (voir section suivante) :

```env
ENCRYPTION_SECRET=<généré par encrypt_all_keys.js>
ANTHROPIC_KEY_ENC=<généré par encrypt_all_keys.js>
OPENAI_KEY_ENC=<généré par encrypt_all_keys.js>
GEMINI_KEY_ENC=<généré par encrypt_all_keys.js>
MISTRAL_KEY_ENC=<généré par encrypt_all_keys.js>
```

---

## 🔐 Chiffrement des clés API (recommandé)

Pour ne pas stocker tes clés en clair dans `.env`, RoboTest Studio fournit un outil de chiffrement **AES-256-CBC** : `encrypt_all_keys.js`. Il génère un secret unique partagé (`ENCRYPTION_SECRET`) et la version chiffrée de chaque clé ; le serveur les déchiffre automatiquement au runtime.

### Étape 1 — Lancer l'outil

```bash
node encrypt_all_keys.js
```

### Étape 2 — Suivre l'invite

Le script génère automatiquement un `ENCRYPTION_SECRET`, puis te demande chaque clé API **en clair**, une par une (Anthropic, OpenAI, Gemini, Mistral). Laisse vide (**Entrée**) pour ignorer un provider que tu n'utilises pas :

```
Clé ANTHROPIC (Enter pour ignorer): sk-ant-...
  ✓ ANTHROPIC chiffré (enc length: 224)
Clé OPENAI (Enter pour ignorer): sk-proj-...
  ✓ OPENAI chiffré (enc length: 352)
Clé GEMINI (Enter pour ignorer): AIzaSy...
  ✓ GEMINI chiffré (enc length: 96)
Clé MISTRAL (Enter pour ignorer):
```

### Étape 3 — Copier le résultat

À la fin, le script affiche des lignes **prêtes à coller**, par exemple :

```
ENCRYPTION_SECRET=a1b2c3...           (32 octets hex)
ANTHROPIC_KEY_ENC=<iv_hex>:<enc_hex>
OPENAI_KEY_ENC=<iv_hex>:<enc_hex>
```

### Étape 4 — Coller dans `.env`

Copie **toutes** ces lignes dans ton fichier `.env`, à la racine `front-back/` (une valeur par ligne).

### Étape 5 — Démarrer

```bash
node server.js
```

Le serveur déchiffre automatiquement les clés au runtime (`decryptApiKey`, AES-256-CBC). C'est tout. ✅

### ⚠️ Points importants

- Le `ENCRYPTION_SECRET` doit **rester dans `.env`** : sans lui, le serveur ne peut pas déchiffrer les clés.
- **Ne commite JAMAIS `.env`** dans git (déjà présent dans `.gitignore`).
- Si tu changes une clé, **relance `encrypt_all_keys.js`** et remplace les lignes correspondantes (garde le même `ENCRYPTION_SECRET`).

### 💡 Alternative simple (sans chiffrement)

Si tu ne veux pas chiffrer, mets la clé **en clair** dans `.env` :

```env
ANTHROPIC_KEY=sk-...
```

Le serveur utilise un fallback automatique. Moins sécurisé, mais plus rapide pour tester.

### Vérifier le format d'une clé chiffrée

```bash
node -e "require('dotenv').config(); const e=process.env.ANTHROPIC_KEY_ENC; const p=e.split(':'); console.log('iv:', p[0].length, 'enc:', p[1]?.length);"
```

Les deux longueurs doivent être **paires** (ex: `iv: 32`, `enc: 224`).

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
│   ├── pages/
│   │   └── main_page.robot  # Page Object (sélecteurs + actions)
│   └── files/               # Fichiers d'upload (images, PDF, CSV, xlsx…) référencés par Choose File
├── tests/
│   └── tests.robot          # Cas de tests
├── screenshots/             # Captures automatiques des runs
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
Utilise `encrypt_all_keys.js` (mode interactif) et garde le **même `ENCRYPTION_SECRET`** pour toutes les clés. En dernier recours, bascule ce provider sur une clé en clair (`*_KEY`).

**Une clé API n'est pas reconnue**
Vérifie que tu n'as **qu'une** forme par provider dans `.env` (soit `*_KEY`, soit `*_KEY_ENC`), et que `ENCRYPTION_SECRET` est présent si tu utilises la forme chiffrée.
