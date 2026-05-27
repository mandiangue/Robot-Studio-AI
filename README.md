# 🤖 QA Agent — Robot Framework × IA

> **L'IA ne remplace pas le QA — elle supprime la partie rébarbative pour que tu te concentres sur ce qui compte.**

Un agent conversationnel propulsé par Claude (Anthropic) qui génère des tests **Robot Framework** en langage naturel, se connecte à **Azure DevOps** et **Jira**, et s'intègre dans **VS Code** via Continue.dev.

---

## ✨ Fonctionnalités

- 💬 **Chat conversationnel** — décris tes tests en français, l'agent génère le code
- 📋 **Cas de tests éditables** — liste modifiable avant génération du code RF
- ⚡ **Génération Robot Framework** — Keyword-Driven, BDD (Given/When/Then), Data-Driven
- 📁 **Architecture multi-fichiers** — `variables.robot`, `keywords.robot`, `tests.robot` séparés
- ☁️ **Azure DevOps** — connexion par token, récupération d'US, génération de tests
- 🟦 **Jira Cloud** — connexion par API token, récupération d'issues, génération de tests
- 💾 **Persistance localStorage** — clé API, historique, sessions, préférences sauvegardés
- 📱 **Responsive** — fonctionne sur desktop, tablet et mobile
- 🔧 **Continue.dev** — intégration VS Code avec Claude directement dans l'éditeur

---

## 📁 Structure du projet

```
├── qa-agent.html          # Interface chat principale
├── qa-agent.css           # Styles
├── qa-agent.js            # Logique agent (IA + Azure + Jira)
├── rf-ia-demo.html        # App de démo générateur RF
├── rf-ia-demo.css         # Styles démo
├── rf-ia-demo.js          # Logique démo
├── server.js              # Proxy Node.js (Azure/Jira si CORS bloqué)
├── package.json           # Dépendances Node
├── continue-config.yaml   # Config Continue.dev pour VS Code
└── README.md
```

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 18+
- **Python** 3.8+
- **Chrome** installé
- Une **clé API Anthropic** → [console.anthropic.com](https://console.anthropic.com)

### Installation Robot Framework

```bash
pip install robotframework robotframework-seleniumlibrary
```

### Lancement de l'app

**Option A — Via Live Server (VS Code)**
Ouvre `qa-agent.html` avec l'extension Live Server → `http://127.0.0.1:5500/qa-agent.html`

**Option B — Via le serveur proxy**
```bash
npm install
node server.js
# Ouvre http://localhost:3001/qa-agent.html
```

> Le serveur proxy est nécessaire si ton organisation bloque les appels CORS directs vers Azure DevOps ou Jira.

---

## 💬 Utilisation de l'agent

### Générer des cas de tests

Tape en langage naturel dans le chat :

```
Connecte-toi sur l'application https://the-internet.herokuapp.com/login
avec username: tomsmith et password: SuperSecretPassword!
et génère 3 cas de tests
```

L'agent génère une **liste de cas de tests éditables** — tu peux modifier, ajouter, supprimer chaque cas avant de générer le code.

### Générer le code Robot Framework

Après avoir validé les cas de tests, clique sur **⚡ Générer le code RF** dans la sidebar ou tape :

```
Génère le code RF
```

Le fichier `.robot` s'affiche avec les boutons **📋 Copier** et **⬇️ Télécharger**.

### Connexion Azure DevOps

```
Connecte-toi sur Azure https://dev.azure.com/MON_ORG/MON_PROJET avec le token MON_TOKEN
```

Puis :
```
Cherche l'US numéro 42
```

> **Créer un token Azure** : `dev.azure.com` → Avatar → Personal Access Tokens → New Token → Work Items (Read)

### Connexion Jira Cloud

```
Connecte-toi sur Jira https://monorg.atlassian.net avec email@company.com et token MON_TOKEN
```

Puis :
```
Cherche l'US Jira PROJ-42
```

> **Créer un token Jira** : [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)

---

## 🎨 Styles de génération

| Style | Description |
|---|---|
| **Keyword-Driven** | Keywords réutilisables dans `*** Keywords ***` |
| **BDD** | `Given / When / Then` en anglais |
| **Data-Driven** | Template + jeux de données |
| **Fichier unique** | Un seul `.robot` |
| **Multi-fichiers** | `variables.robot` + `keywords.robot` + `test.robot` |

---

## 🔧 Continue.dev (VS Code)

### Configuration

Copie `continue-config.yaml` vers :
- **Windows** : `%USERPROFILE%\.continue\config.yaml`
- **Mac/Linux** : `~/.continue/config.yaml`

Remplace `sk-ant-VOTRE_CLE_ICI` par ta clé API Anthropic, puis redémarre VS Code.

### Utilisation dans VS Code

Ouvre le chat Continue (`Ctrl+L`) et parle naturellement :

```
Génère un test RF pour la page login de https://the-internet.herokuapp.com/login
```

---

## ▶️ Exécuter les tests générés

```bash
pip install robotframework robotframework-seleniumlibrary

# Lancer un test
robot test_login.robot

# Avec mot de passe sécurisé via variable d'environnement
export ROBOT_PASSWORD="MonMotDePasse"
robot test_login.robot
```

> Chrome s'ouvre et exécute les tests en temps réel.

---

## 🔐 Sécurité

- Ne jamais committer ta clé API dans le dépôt
- Ajoute un `.gitignore` avec `.env` et les fichiers sensibles
- Les tokens sont stockés dans le `localStorage` — efface-les avec le bouton **✕** dans l'interface
- Pour les mots de passe dans les tests RF :
  ```robot
  ${PASSWORD}    %{ROBOT_PASSWORD}
  ```

---

## 🎯 Scénario de démo

| # | Action | Résultat |
|---|---|---|
| 1 | Ouvre `qa-agent.html` | Interface chat |
| 2 | Colle ta clé API | Statut vert `⬤ ready` |
| 3 | Décris un test | Cas de tests éditables |
| 4 | Modifie les cas | Modifications en temps réel |
| 5 | **⚡ Générer le code RF** | Fichier `.robot` téléchargeable |
| 6 | Connecte-toi à Jira/Azure | Récupère une vraie US |
| 7 | Génère depuis l'US | Tests basés sur les critères d'acceptance |
| 8 | `robot test.robot` | Chrome piloté en live 🔥 |

---

## 🛠️ Stack technique

- **Frontend** : HTML5 / CSS3 / JavaScript vanilla
- **IA** : Claude Haiku 4.5 via API Anthropic
- **Tests** : Robot Framework + SeleniumLibrary
- **Intégration** : Azure DevOps REST API, Jira Cloud REST API
- **IDE** : Continue.dev (VS Code)
- **Proxy** : Node.js + Express (optionnel)

---

## 📄 Licence

MIT — libre d'utilisation, de modification et de distribution.
