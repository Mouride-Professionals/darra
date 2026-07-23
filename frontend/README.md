# 🕌 Daara Touba — Frontend

Interface React (Vite) bilingue FR/AR pour la gestion des Daara de Touba.

---

##  Démarrage rapide

### 1. Prérequis
- Node.js ≥ 18
- Backend Daara API lancé sur le port 5001

### 2. Installation

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5001/api
```

### 3. Lancement

```bash
npm run dev      # http://localhost:3000
npm run build    # Build production → dist/
npm run preview  # Preview du build
```

---

## 🏗 Architecture

```
src/
├── App.jsx                     # Routing auth (login ↔ app)
├── main.jsx                    # Point d'entrée React
├── index.css                   # Reset CSS global
├── api/
│   ├── client.js               # Fetch client avec auto-refresh JWT
│   └── index.js                # authApi, quartierApi, daaraApi
├── context/
│   └── AuthContext.jsx         # État global auth + rôles
└── pages/
    ├── LoginPage.jsx            # Page de connexion bilingue
    └── DaaraListPage.jsx        # Page principale (liste + carte)
```

---

##  Fonctionnalités

###  Authentification
- Login / logout avec JWT (access token 15min + refresh cookie httpOnly)
- Refresh silencieux automatique toutes les 13 min
- Déconnexion forcée sur 401

###  Multilingue FR / عربي
- Bascule instantanée dans le header
- Noms des quartiers affichés en arabe ou en français selon la langue active
- Direction du layout (`ltr` / `rtl`) automatique

###  Liste des Daara
- Groupement par quartier avec watermark, barre colorée et stats
- Recherche par nom, téléphone ou quartier
- Filtre par quartier (chips colorés)
- Affichage garçons 👦 / filles 👧 avec barre de répartition
- Totaux globaux dans le header (garçons + filles + daara + quartiers)

###  Gestion des Daara (ADMIN+)
- Ajout avec compteur garçons/filles intégré (+1 / -1 / +10 / -10)
- Modification avec confirmation de suppression en 2 étapes
- Mise à jour en temps réel de la liste et de la carte

###  Gestion des Quartiers (SUPER_ADMIN)
- Ajout d'un quartier : nom arabe, nom français, couleur, coordonnées
- Immédiatement disponible dans les dropdowns et la carte

### Carte (Leaflet + OpenStreetMap)
- **Mode Concentration** : un cercle par quartier dont la taille reflète le nombre de daara, avec label du nombre
- **Mode Points** : marqueur individuel par daara avec popup (nom, téléphone, élèves)
- Recherche en superposition sur la carte
- Légende des quartiers avec couleurs

###  Gestion des rôles
- `SUPER_ADMIN` : accès complet (daara + quartiers + utilisateurs)
- `ADMIN` : CRUD daara de son quartier uniquement
- `LECTEUR` : lecture seule (boutons masqués)

---

##  Connexion par défaut

Après seed du backend :

```
Email    : admin@daara-touba.sn
Password : Admin@2024!
```

---

## 📦 Dépendances principales

| Package          | Rôle                        |
|------------------|-----------------------------|
| React 18         | UI                          |
| Vite 5           | Build tool                  |
| Leaflet 1.9 (CDN)| Cartographie                |
| Tajawal (Google) | Police arabe/latin          |
