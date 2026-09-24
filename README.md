# GREEN TECHNOLOGIES WEBSITE

Socle technique professionnel fullstack combinant une **API REST Laravel 13 versionnée (/api/v1)** et une **SPA React 19 + TypeScript + Vite + Tailwind CSS**.

---

## 🏗️ Architecture du Projet

```text
GREEN TECHNOLOGIES WEBSITE/
├── .gitignore                      # Ignore .env, vendor, node_modules, logs, sqlite
├── README.md                       # Documentation technique
├── vercel.json                     # Configuration Vercel racine (fallback sécurisé)
│
├── backend/                        # API REST Laravel 13 (PHP 8.4)
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/
│   │   │           ├── BaseApiController.php    # Contrôleur API de base avec ApiResponse
│   │   │           └── V1/
│   │   │               └── HealthController.php # Endpoint technique /api/v1/health
│   │   ├── Models/
│   │   └── Traits/
│   │       └── ApiResponse.php                  # Trait de réponses standardisées
│   ├── bootstrap/
│   │   └── app.php                              # Exception handling centralisé & Sanctum
│   ├── config/
│   │   ├── cors.php                             # Configuration CORS dynamique
│   │   └── sanctum.php
│   ├── database/
│   │   ├── database.sqlite                      # Base locale SQLite (zéro dépendance externe)
│   │   └── migrations/
│   ├── routes/
│   │   ├── api.php                              # Routeur racine API (/api)
│   │   ├── api/
│   │   │   └── v1.php                           # Routes de la version 1 (/api/v1)
│   │   └── web.php
│   ├── .env.example
│   ├── .env                                     # Secrets locaux (non versionnés)
│   └── composer.json
│
└── frontend/                       # Client SPA React 19 / TypeScript / Vite
    ├── src/
    │   ├── api/
    │   │   └── client.ts                        # Client HTTP Axios centralisé (intercepteurs)
    │   ├── components/                          # Composants UI de base (Header, Footer, etc.)
    │   ├── hooks/                               # Hooks personnalisés (useHealthCheck)
    │   ├── layouts/                             # Layouts applicatifs (RootLayout)
    │   ├── pages/                               # Vues applicatives (HealthPage, NotFoundPage)
    │   ├── routes/                              # Routeur React Router 7
    │   ├── types/
    │   │   └── api.ts                           # Contrat d'interface TypeScript API
    │   ├── App.tsx                              # Point d'entrée TanStack Query & Router
    │   ├── index.css                            # Styles globaux Tailwind CSS v4
    │   └── main.tsx
    ├── .env.example
    ├── .env                                     # VITE_API_URL=http://localhost:8000/api/v1
    ├── package.json
    ├── tsconfig.json
    ├── vercel.json                              # Configuration Vercel dédiée au sous-dossier frontend
    └── vite.config.ts                           # Bundler Vite avec React et Tailwind
```

---

## 📋 Prérequis

* **PHP** : `>= 8.2` (actuellement validé sur PHP 8.4 avec extensions `pdo_sqlite`, `openssl`, `mbstring`, `curl`)
* **Composer** : `>= 2.x`
* **Node.js** : `>= 18.x` (validé sur Node v24)
* **npm** : `>= 10.x`

---

## ⚙️ Installation & Démarrage

### 1. Backend (Laravel)

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

> **Endpoint API V1** : `http://localhost:8000/api/v1/health`  
> **Documentation des routes** : `php artisan route:list --path=api`

### 2. Frontend (React / Vite)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

> **Application Web** : `http://localhost:5173`

---

## 📡 Standard des Réponses API (Contrat JSON)

### Réponse Succès (HTTP 200, 201)
```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

### Réponse Erreur / Validation (HTTP 400, 422, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["Message d'erreur"]
  }
}
```

---

## 🌐 Déploiement Vercel (Frontend)

1. Importer le dépôt sur **Vercel**.
2. Dans **Project Settings > General** :
   * **Root Directory** : `frontend` (Recommandé).
3. Dans **Project Settings > Environment Variables** :
   * Définir `VITE_API_URL` avec l'URL publique de l'API Laravel (ex: `https://api.votre-domaine.com/api/v1`).
