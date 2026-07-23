# 🕌 Daara Touba — API Backend

API REST Node.js / Express / MongoDB pour la gestion des Daara de Touba.

---

## ⚡ Démarrage rapide

### 1. Prérequis
- Node.js ≥ 18
- MongoDB (local ou Atlas)

### 2. Installation

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs (MONGO_URI, secrets JWT…)
```

### 3. Seed (données initiales)

```bash
npm run seed
```

Crée **26 quartiers**, **195 daara** et un **super admin** :
- Email : `admin@daara-touba.sn`
- Mot de passe : `Admin@2024!`

### 4. Lancement

```bash
npm run dev   # développement (nodemon)
npm start     # production
```

---

## 🏗 Architecture

```
src/
├── app.js                  # Point d'entrée Express
├── config/
│   ├── database.js         # Connexion Mongoose
│   └── logger.js           # Winston logger
├── models/
│   ├── User.model.js       # Utilisateurs + rôles
│   ├── Quartier.model.js   # Quartiers de Touba
│   └── Daara.model.js      # Daara (garçons + filles virtual total)
├── controllers/
│   ├── auth.controller.js
│   ├── daara.controller.js
│   └── quartier.controller.js
├── services/               # Logique métier
│   ├── auth.service.js
│   ├── daara.service.js
│   └── quartier.service.js
├── routes/
│   ├── index.js
│   ├── auth.routes.js
│   ├── daara.routes.js
│   └── quartier.routes.js
├── middleware/
│   ├── auth.middleware.js  # protect + authorize
│   ├── validate.js         # Joi schemas
│   └── errorHandler.js     # Gestion globale des erreurs
├── utils/
│   ├── AppError.js         # Classe d'erreur opérationnelle
│   ├── asyncHandler.js     # Wrapper try/catch
│   └── tokens.js           # JWT access + refresh
└── seeds/
    └── seed.js
```

---

## 🔐 Authentification

JWT **stateless** avec rotation du refresh token :

| Token        | Durée  | Transport          |
|--------------|--------|--------------------|
| Access token | 15 min | Header `Authorization: Bearer` |
| Refresh token| 7 jours| Cookie `httpOnly`  |

### Flux
1. `POST /api/auth/login` → reçoit `accessToken` + cookie `refreshToken`
2. Requêtes protégées → `Authorization: Bearer <accessToken>`
3. Expiration → `POST /api/auth/refresh` (cookie envoyé automatiquement) → nouveau token pair
4. `POST /api/auth/logout` → révocation côté serveur + suppression cookie

---

## 👤 Rôles

| Rôle          | Droits                                       |
|---------------|----------------------------------------------|
| `SUPER_ADMIN` | Tout : quartiers, daara, utilisateurs        |
| `ADMIN`       | CRUD daara de son quartier assigné seulement |
| `LECTEUR`     | Lecture seule                                |

---

## 📡 Endpoints

### Auth
```
POST   /api/auth/login
POST   /api/auth/register    (SUPER_ADMIN)
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PATCH  /api/auth/password
```

### Daara
```
GET    /api/daara                 Liste paginée (search, quartierId, statut)
GET    /api/daara/stats           Totaux globaux (garçons, filles, élèves)
GET    /api/daara/concentration   Concentration par quartier (carte)
GET    /api/daara/:id
POST   /api/daara                 (ADMIN+)
PATCH  /api/daara/:id             (ADMIN+)
DELETE /api/daara/:id             (ADMIN+)
```

### Quartiers
```
GET    /api/quartiers
GET    /api/quartiers/:id
POST   /api/quartiers             (SUPER_ADMIN)
PATCH  /api/quartiers/:id         (SUPER_ADMIN)
DELETE /api/quartiers/:id         (SUPER_ADMIN)
```

### Health
```
GET    /api/health
```

---

## 🛡 Sécurité
- **Helmet** — headers HTTP sécurisés
- **CORS** — origine contrôlée par `CLIENT_URL`
- **Rate limiting** — 100 req/15min global, 10 req/15min sur auth
- **mongo-sanitize** — prévention injection NoSQL
- **bcrypt** (12 rounds) — hash des mots de passe
- **Refresh token hash** — stocké hashé en DB, rotation à chaque usage

---

## 🌱 Variables d'environnement

| Variable               | Description                        | Défaut        |
|------------------------|------------------------------------|---------------|
| `PORT`                 | Port du serveur                    | `5001`        |
| `MONGO_URI`            | URI MongoDB                        | —             |
| `JWT_ACCESS_SECRET`    | Secret access token (256 bits min) | —             |
| `JWT_REFRESH_SECRET`   | Secret refresh token (256 bits min)| —             |
| `JWT_ACCESS_EXPIRES`   | Durée access token                 | `15m`         |
| `JWT_REFRESH_EXPIRES`  | Durée refresh token                | `7d`          |
| `CLIENT_URL`           | URL frontend (CORS)                | `http://localhost:3000` |
| `COOKIE_SECURE`        | Cookie HTTPS only (`true` en prod) | `false`       |
