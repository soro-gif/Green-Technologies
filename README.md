# GREEN TECHNOLOGIES WEBSITE

Application Web moderne fullstack combinant une API REST robuste sous **Laravel 13** et une application monopage (SPA) performante sous **React 19 + Vite + TypeScript**.

---

## 🏗️ Architecture

```text
GREEN TECHNOLOGIES WEBSITE/
├── backend/                       # API REST Laravel 13 (PHP 8.4)
│   ├── app/
│   ├── config/
│   ├── database/                  # Migrations & SQLite / MySQL
│   ├── routes/
│   │   └── api.php                # Endpoints REST (/api/health, etc.)
│   ├── .env.example
│   └── composer.json
│
├── frontend/                      # Client SPA React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── api/                   # Client HTTP Axios configuré
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── .gitignore
├── vercel.json                    # Configuration Vercel (racine)
└── README.md
```

---

## 🚀 Démarrage Rapide en Local

### 1. Prérequis
- **PHP** >= 8.2 (actuellement validé sur PHP 8.4)
- **Composer** >= 2.x
- **Node.js** >= 18.x (actuellement validé sur Node v24)
- **npm** >= 10.x

### 2. Backend (Laravel)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```
> L'API démarre sur : `http://127.0.0.1:8000` (Endpoint de test : `http://127.0.0.1:8000/api/health`)

### 3. Frontend (React + Vite)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
> L'application frontend démarre sur : `http://localhost:5173`

---

## 🌐 Déploiement sur Vercel (Frontend)

1. Connectez votre dépôt GitHub à **Vercel**.
2. Dans **Project Settings > General** :
   - **Root Directory** : Définissez sur `frontend` (Recommandé).
3. Dans **Project Settings > Environment Variables** :
   - Ajoutez la variable `VITE_API_URL` pointant vers l'URL publique de votre backend Laravel hébergé (ex: `https://api.votre-domaine.com/api`).
