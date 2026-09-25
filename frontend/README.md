# GREEN TECHNOLOGIES BTP - Frontend Application

Application web et backoffice professionnel pour **GREEN TECHNOLOGIES BTP**, bureau d'études et de réalisation en ingénierie durable :
1. **Eau & Hydraulique** (Adduction, forages, traitement)
2. **Énergie Solaire & Renouvelable** (Centrales photovoltaïques, pompage solaire, hybridation)
3. **Agrotechnologies** (Irrigation intelligente, serres climatisées, valorisation agricole)
4. **BTP & Génie Civil** (Ouvrages d'art, voiries, infrastructures industrielles)

---

## 🚀 Technologies & Architecture

- **Core** : React 19 + TypeScript 5.7
- **Bundler** : Vite 6
- **Styling** : Tailwind CSS v4 + Design System personnalisé (Brand Colors : Vert Émeraude, Bleu Cyan, Lime, Orange BTP, Slate Sombre)
- **Routing** : React Router v7 avec Data & Protected Routes
- **Formulaires & Validation** : React Hook Form + Zod
- **Client API** : Axios avec Intercepteurs (Bearer Token, Refresh, gestion 401/403/422/500)
- **Typage Strict** : Modèles synchronisés avec le backend Laravel 11

---

## 📁 Structure du Projet

```
frontend/
├── public/
│   ├── logo.png                # Logo officiel 4 pôles
│   └── favicon.ico
├── src/
│   ├── api/                    # Client Axios et services modulaires (quotes, services, projects...)
│   ├── assets/                 # Logo et icônes statiques
│   ├── auth/                   # AuthContext, AuthProvider, useAuth hook, auth.types
│   ├── components/
│   │   ├── layout/             # Navbar, Footer
│   │   ├── ui/                 # Design System (Button, Input, Card, Modal, Badge, Pagination...)
│   │   └── ProtectedRoute.tsx  # Guard de permissions et rôles
│   ├── layouts/                # PublicLayout, AdminLayout, AuthLayout, RootLayout
│   ├── pages/                  # Pages publiques (Accueil, Domaines, Devis, Réalisations...)
│   │   ├── admin/              # Backoffice (Dashboard, Devis, Messages, Services, Projets...)
│   │   └── auth/               # Connexion
│   ├── routes/                 # Définition centralisée de l'arbre de navigation
│   ├── types/                  # Modèles de données & DTOs API
│   ├── utils/                  # Fonctions utilitaires
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

---

## ⚙️ Configuration & Variables d'Environnement

Créez un fichier `.env` ou `.env.local` à la racine de `frontend/` :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

> **Sécurité** : Les variables `VITE_*` sont injectées dans le bundle client. N'y placez jamais de secrets privés.

---

## 💻 Démarrage en Développement

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

---

## 🛠️ Scripts Disponibles

- `npm run dev` : Lance le serveur de développement Vite avec HMR
- `npm run build` : Compile TypeScript (`tsc -b`) et génère le bundle de production dans `dist/`
- `npm run typecheck` : Vérifie la validité des types TypeScript sans émettre de fichiers
- `npm run preview` : Prévisualise localement le bundle généré dans `dist/`

---

## 🌐 Déploiement Vercel

Le projet est préconfiguré pour un déploiement Vercel optimal :

- **Root Directory** : `frontend`
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`
- **Environment Variables** : Définir `VITE_API_BASE_URL` avec l'URL publique de production de l'API Laravel.
