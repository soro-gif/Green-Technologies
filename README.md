# GREEN TECHNOLOGIES — Plateforme Web & API Professionnelle

Socle fullstack moderne combinant une **API RESTful sécurisée Laravel 13** et une **Single Page Application (SPA) React 19 + TypeScript + Vite + Tailwind CSS**, conçue pour **GREEN TECHNOLOGIES**, entreprise leader en ingénierie environnementale, hydraulique, énergie et génie civil en Côte d'Ivoire.

---

## Sommaire
- [Présentation & Pôles d'Expertise](#-présentation--pôles-dexpertise)
- [Fonctionnalités Clés](#-fonctionnalités-clés)
- [Architecture Technique](#️-architecture-technique)
- [Sécurité & Contrôle d'Accès](#-sécurité--contrôle-daccès)
- [Comptes de Démonstration](#-comptes-de-démonstration)
- [Guide d'Installation & Démarrage](#️-guide-dinstallation--démarrage)
- [Contrat & Endpoints API (v1)](#-contrat--endpoints-api-v1)
- [Tests Automatisés & QA](#-tests-automatisés--qa)
- [Déploiement en Production](#-déploiement-en-production)
- [Coordonnées Officielles](#-coordonnées-officielles)

---

## Présentation & Pôles d'Expertise

GREEN TECHNOLOGIES intervient sur 4 pôles stratégiques de développement durable :
1. **Eau & Hydraulique :** Forages d'hydraulique villageoise et urbaine (HVA/HVU), stations de filtration, traitement d'eau potable, châteaux d'eau et réseaux d'adduction.
2. **Énergie Solaire :** Centrales photovoltaïques autonomes et hybrides, pompage solaire agricole, éclairage public solaire intelligent, audits énergétiques.
3. **Agrotechnologies :** Systèmes d'irrigation goutte-à-goutte, serres automatisées, mécanisation durable, valorisation des sols et intrants écologiques.
4. **BTP & Génie Civil :** Voiries et réseaux divers (VRD), terrassement, bâtiments industriels et agricoles, ouvrages de franchissement et génie hydraulique.

---

## Fonctionnalités Clés

### 1. Site Public & Vitrine Institutionnelle
- **Accueil dynamique :** Métriques clés animées en temps réel (`AnimatedCounter`), présentation des pôles, réalisations à la une, témoignages certifiés et derniers articles.
- **Catalogue interactif des prestations :** Recherche instantanée, filtrage par pôle technique, fiches détaillées avec garanties et spécifications.
- **Portfolio d'études de cas :** Réalisations géolocalisées avec galeries photos, maîtres d'ouvrage, indicateurs d'impact et statuts de chantiers.
- **Demande de Devis & Suivi en Ligne :**
  - Formulaire de chiffrage complet (coordonnées, ville, pôle, budget prévisionnel, détails).
  - Attribution automatique d'un numéro de référence unique (ex: `DEV-202609-XXXX`).
  - Module de suivi du devis en temps réel accessible aux visiteurs et clients.
- **Formulaire de Contact :** Transmission directe des messages aux conseillers techniques avec validation en français et coordonnées de l'agence.
- **SEO & Performance :** Balises OpenGraph, Twitter Cards, Sitemap XML dynamique, Robots.txt, fallbacks d'images multi-niveaux et bundles optimisés.

### 2. Espace Client (Portail Utilisateur)
- Inscription et authentification sécurisée par jetons Sanctum.
- Gestion du profil personnel avec pré-remplissage automatique des formulaires.
- Tableau de bord personnel avec liste des devis soumis, statuts de traitement et historique des messages échangés.

### 3. Backoffice Administrateur
- **Dashboard analytique :** Statistiques globales, métriques de conversion, répartition des demandes.
- **Gestion des Devis :** Consultation, validation, mise à jour des statuts (`en attente`, `en étude`, `chiffré`, `accepté`, `rejeté`), notes d'administration et export Excel (`.xls`).
- **Gestion des Messages de Contact :** Lecture, archivage, réponses et export Excel.
- **Gestion de Contenu (CMS) :** CRUD complet des pôles, prestations, chantiers réalisés, actualités/articles de blog, témoignages et gestionnaires de médias.
- **Gestion des Utilisateurs :** Attribution des rôles (`super_admin`, `admin`, `editor`, `user`), activation/désactivation de comptes.

---

## Architecture Technique

```text
GREEN TECHNOLOGIES WEBSITE/
├── backend/                                  # API RESTful Laravel 13 (PHP 8.4)
│   ├── app/
│   │   ├── Enums/                            # Enums stricts (UserRole, QuoteStatus, MessageStatus...)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/           # Contrôleurs API versionnés
│   │   │   │   ├── Admin/                    # Contrôleurs réservés aux administrateurs
│   │   │   │   ├── Auth/                     # Contrôleurs d'authentification Sanctum
│   │   │   │   ├── User/                     # Contrôleurs de l'espace client personnel
│   │   │   │   └── ...                       # Contrôleurs publics (Catalogues, Devis, Contact)
│   │   ├── Middleware/                   # Middlewares de sécurité (Role, Permission)
│   │   ├── Requests/                     # FormRequests avec validation et messages en français
│   │   └── Resources/                    # API JsonResources (DTOs de transformation)
│   │   ├── Models/                           # Modèles Eloquent & Relations typées
│   │   ├── Policies/                         # Politiques d'autorisation métier
│   │   ├── Services/                         # Couche service & logique métier découplée
│   │   └── Traits/ApiResponse.php            # Format de réponse JSON standardisé
│   ├── database/
│   │   ├── migrations/                       # Schéma de base de données relationnelle
│   │   └── seeders/                          # Données réalistes pour l'environnement de démo
│   ├── routes/api/v1.php                     # Définition de toutes les routes /api/v1
│   └── tests/Feature/                        # 38 tests automatisés (PHPUnit)
│
├── frontend/                                 # Single Page Application (React 19 + Vite)
│   ├── public/                               # Images haute fidélité, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── api/                              # Couche de communication HTTP (Axios)
│   │   ├── auth/                             # Contexte d'authentification React & Guards
│   │   ├── components/
│   │   │   ├── layout/                       # Navbar (Fixe/Tél), Footer, Topbar
│   │   │   └── ui/                           # Design System (Button, Input, Card, Modal, AnimatedCounter...)
│   │   ├── pages/
│   │   │   ├── admin/                        # Vues du Backoffice d'administration
│   │   │   ├── user/                         # Vues du Portail client
│   │   │   └── ...                           # Vues publiques (Accueil, Domaines, Services, Réalisations...)
│   │   ├── routes/                           # Routage React Router v7 avec protection par rôle
│   │   ├── types/                            # Types et interfaces TypeScript stricts
│   │   └── utils/                            # Résolution d'images, formatage de devises (FCFA), dates
│   ├── tsconfig.json                         # Configuration TypeScript en mode strict
│   └── vite.config.ts                        # Configuration Vite & Tailwind CSS v4
```

---

## Sécurité & Contrôle d'Accès

- **Authentification par Jetons :** Jetons révocables émis via Laravel Sanctum stockés de façon sécurisée.
- **Contrôle d'accès basé sur les rôles (RBAC) :**
  - `Visiteur` : Accès en lecture seule aux catalogues publics et formulaires de contact / devis.
  - `User` : Accès restreint à son propre espace client (`/api/v1/user/*`). Blocage strict de toute tentative d'accès à l'administration (**HTTP 403 Forbidden**).
  - `Admin` / `Super Admin` : Accès aux fonctions d'administration et aux opérations CRUD avancées.
- **Protection contre les attaques courantes :**
  - **IDOR & Usurpation :** Les requêtes authentifiées forcent l'attribution des ressources à l'utilisateur connecté côté serveur.
  - **Escalade de privilèges :** Impossibilité d'altérer son rôle via les requêtes de mise à jour de profil.
  - **Injections SQL & XSS :** Requêtes préparées Eloquent / PDO et échappement automatique React.
  - **Rate Limiting :** Protection des routes sensibles (`login`, `register`, `contact`) contre le brute force.

---

## Comptes de Démonstration

En développement uniquement, après l'exécution des seeders (`php artisan db:seed`), les comptes suivants sont disponibles. Ils ne sont jamais créés en production, où le compte administrateur vient des variables `ADMIN_EMAIL` et `ADMIN_PASSWORD` :

| Rôle | Email | Mot de passe | Accès |
| :--- | :--- | :--- | :--- |
| **Super Administrateur** | `admin@greentechnologies.ci` | `password` | Dashboard & Gestion globale |
| **Client / Utilisateur** | `client@greentechnologies.ci` | `password` | Espace Client & Suivi de devis |

---

## Guide d'Installation & Démarrage

### Prérequis
- **PHP** : `>= 8.2` (PHP 8.4 recommandé) avec extensions `pdo_sqlite` (ou `pdo_mysql`), `openssl`, `mbstring`, `curl`.
- **Composer** : `>= 2.x`
- **Node.js** : `>= 18.x` & **npm** : `>= 9.x`

### 1. Configuration du Backend (Laravel)
```bash
# Se positionner dans le dossier backend
cd backend

# Installer les dépendances PHP
composer install

# Configurer l'environnement
cp .env.example .env
php artisan key:generate

# Exécuter les migrations et injecter les données de démonstration
php artisan migrate:fresh --seed

# Démarrer le serveur API local
php artisan serve
```
> L'API REST est accessible sur : `http://localhost:8000/api/v1`

### 2. Configuration du Frontend (React / Vite)
```bash
# Se positionner dans le dossier frontend
cd ../frontend

# Installer les dépendances Node.js
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Lancer le serveur de développement Vite
npm run dev
```
> L'application Web est accessible sur : `http://localhost:5173`

---

## Contrat & Endpoints API (v1)

### Format Standardisé des Réponses
```json
// Succès (HTTP 200, 201)
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}

// Erreur de Validation (HTTP 422)
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Veuillez saisir une adresse email valide."]
  }
}
```

### Principales Routes API

| Méthode | Endpoint | Description | Accès |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Diagnostic de santé (API, DB, Version) | Public |
| `GET` | `/api/v1/categories` | Liste des 4 pôles d'expertise | Public |
| `GET` | `/api/v1/services` | Catalogue paginé des prestations | Public |
| `GET` | `/api/v1/projects` | Portfolio des chantiers & réalisations | Public |
| `GET` | `/api/v1/articles` | Actualités et articles techniques | Public |
| `POST` | `/api/v1/quotes` | Soumission d'une demande de devis | Public / Auth |
| `GET` | `/api/v1/quotes/track/{ref}`| Suivi de l'état d'avancement d'un devis | Public |
| `POST` | `/api/v1/contact` | Envoi d'un message de contact | Public |
| `POST` | `/api/v1/auth/login` | Connexion utilisateur / admin | Public |
| `POST` | `/api/v1/auth/register`| Création d'un compte client | Public |
| `GET` | `/api/v1/user/quotes` | Devis de l'utilisateur connecté | Authentifié (`user`) |
| `GET` | `/api/v1/admin/dashboard-stats` | Métriques & KPI du Backoffice | Admin (`admin`, `super_admin`) |
| `GET` | `/api/v1/admin/quotes/export` | Exportation Excel des devis | Admin (`admin`, `super_admin`) |

---

## Tests Automatisés & QA

Le projet dispose d'une suite complète de tests garantissant la robustesse technique :

```bash
# 1. Exécuter tous les tests backend (PHPUnit)
cd backend
php artisan test

# 2. Vérification statique des types frontend (TypeScript)
cd ../frontend
npm run typecheck

# 3. Validation de la compilation de production
npm run build
```

**Bilan des tests :**
- **38 tests PHPUnit** exécutés et validés (158 assertions).
- **0 erreur TypeScript** (`tsc -b`).
- **Bundle de production** compilé et minifié avec succès.

---

## Déploiement en Production

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Lier le dépôt GitHub à votre plateforme.
2. Définir le **Root Directory** sur `frontend`.
3. Configurer la variable d'environnement :
   - `VITE_API_URL` = `https://api.votredomaine.com/api/v1`
4. Commande de build : `npm run build` | Dossier de sortie : `dist`.

### Backend (Serveur VPS / Nginx / Apache)
1. Configurer un virtual host pointant sur `backend/public`.
2. S'assurer des permissions d'écriture sur `storage/` et `bootstrap/cache/`.
3. Définir dans le fichier `.env` :
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=https://api.votredomaine.com`
4. Exécuter les commandes d'optimisation :
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

---

## Coordonnées Officielles

- **Siège Social :** Cocody Riviera Palmeraie, Abidjan, Côte d'Ivoire
- **Ligne Fixe :** `+225 27 22 58 40 16`
- **Mobile / WhatsApp :** `+225 07 04 90 10 34`
- **Email :** `contact@greentechnologies.ci`
- **Horaires :** Lundi au Vendredi : 08h00 – 18h00

---

*© 2026 GREEN TECHNOLOGIES. Tous droits réservés. Conçu selon les normes d'ingénierie et de développement durable.*