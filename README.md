# 🎓 Plateforme de Déclaration & Suivi de Stages

Système complet de gestion des déclarations de stages étudiants avec interface moderne en mode sombre.

## 👥 Équipe

- **Wafae El Kari** - wafae.elkari@etudiant.ma
- **Souha Siragi** - souha.siragi@etudiant.ma

## 📌 Description

Application web permettant aux étudiants de déclarer leurs stages et à l'administration de les valider ou refuser avec commentaires. Interface professionnelle en mode sombre avec statistiques en temps réel.

## 🌟 Fonctionnalités

### Pour les Étudiants
- ✅ Déclaration de stage (entreprise, sujet, dates)
- ✅ Consultation du statut (en attente, validé, refusé)
- ✅ Visualisation des commentaires de l'administration
- ✅ Interface intuitive et responsive

### Pour l'Administration
- ✅ Dashboard avec statistiques en temps réel
- ✅ Liste complète des déclarations
- ✅ Validation/Refus avec commentaires
- ✅ Recherche dynamique par étudiant ou entreprise
- ✅ Filtres par statut (tous, en attente, validés, refusés)

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + **Express.js** - Serveur API REST
- **MySQL** - Base de données relationnelle
- **CORS** - Gestion des requêtes cross-origin

### Frontend
- **React.js** - Framework UI
- **Lucide React** - Icônes modernes
- **CSS personnalisé** - Mode sombre professionnel

## 📦 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MySQL (v8 ou supérieur)
- npm ou yarn

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE-USERNAME/stage-platform.git
cd stage-platform
```

### 2. Configuration de la base de données

Créer la base de données MySQL :

```sql
CREATE DATABASE stage_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configuration du Backend

```bash
cd backend
npm install
```

Créer le fichier `.env` :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=stage_platform
```

Démarrer le serveur :

```bash
node server.js
```

Le backend démarre sur `http://localhost:5000`

### 4. Configuration du Frontend

```bash
cd frontend
npm install
npm start
```

Le frontend s'ouvre automatiquement sur `http://localhost:3001`

## 📊 Structure de la Base de Données

### Table `users`
| Champ | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Identifiant unique |
| nom | VARCHAR(100) | Nom complet |
| email | VARCHAR(150) | Email (unique) |
| role | ENUM | 'etudiant' ou 'admin' |
| created_at | TIMESTAMP | Date de création |

### Table `stages`
| Champ | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Identifiant unique |
| id_etudiant | INT (FK) | Référence vers users |
| entreprise | VARCHAR(200) | Nom de l'entreprise |
| sujet | TEXT | Description du stage |
| date_debut | DATE | Date de début |
| date_fin | DATE | Date de fin |
| statut | ENUM | 'en_attente', 'valide', 'refuse' |
| commentaire | TEXT | Commentaire de l'admin |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |

## 🔌 API Endpoints

### Users
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/email/:email` - Utilisateur par email
- `POST /api/users` - Créer un utilisateur

### Stages
- `GET /api/stages` - Tous les stages
- `GET /api/stages/:id` - Stage par ID
- `GET /api/stages/etudiant/:id` - Stages d'un étudiant
- `POST /api/stages` - Créer une déclaration
- `PUT /api/stages/:id/statut` - Modifier le statut
- `DELETE /api/stages/:id` - Supprimer un stage

### Statistiques
- `GET /api/statistiques` - Statistiques globales

## 🎨 Captures d'écran

### Page de Connexion
Interface de connexion avec sélection du profil utilisateur.

### Dashboard Étudiant
Vue étudiant avec liste des déclarations et statuts.

### Dashboard Admin
Vue administrateur avec statistiques, recherche et validation des stages.

## 🚀 Utilisation

### Connexion
1. Sélectionnez un profil dans la liste déroulante
2. Cliquez sur "Se connecter"

### Étudiant - Déclarer un stage
1. Cliquez sur "Déclarer un stage"
2. Remplissez tous les champs requis
3. Cliquez sur "Enregistrer"

### Admin - Valider/Refuser un stage
1. Cliquez sur "Modifier le statut"
2. Ajoutez un commentaire (optionnel)
3. Cliquez sur "Valider" ou "Refuser"

## 📈 Fonctionnalités Bonus

- ✅ Statistiques en temps réel
- ✅ Recherche dynamique
- ✅ Filtres multiples
- ✅ Commentaires sur les décisions
- ✅ Design responsive
- ✅ Animations fluides
- ✅ Mode sombre professionnel

## 📝 Structure du Projet

```
stage-platform/
├── backend/
│   ├── server.js          # Serveur Express
│   ├── package.json       # Dépendances backend
│   └── .env              # Configuration (non versionné)
├── frontend/
│   ├── src/
│   │   ├── App.js        # Application React
│   │   └── index.css     # Styles CSS
│   ├── public/
│   └── package.json       # Dépendances frontend
├── .gitignore             # Fichiers à ignorer
└── README.md              # Documentation

```

## 🔒 Sécurité

**Note** : Ce projet est développé à des fins éducatives. Pour une utilisation en production, il est recommandé d'ajouter :
- Authentification JWT
- Hash des mots de passe
- Validation des entrées
- HTTPS
- Rate limiting

## 📄 Licence

Projet académique - Usage éducatif uniquement

## 👨‍💻 Auteurs

Développé par **Wafae El Kari** et **Souha Siragi** dans le cadre d'un projet académique.
