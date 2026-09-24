# Spécification Authentification & Contrôle d'Accès (RBAC) — GREEN TECHNOLOGIES

## 1. Stratégie d'Authentification

* **Technologie** : **Laravel Sanctum** (Personal Access Tokens cryptographiques).
* **Format des requêtes authentifiées** : `Authorization: Bearer <token>`
* **Stockage Client** : `localStorage` (`auth_token`) avec intercepteur Axios automatique.
* **Sécurité & Révocation** : Révocation du jeton courant à la déconnexion (`/api/v1/auth/logout`) et révocation globale lors du reset de mot de passe.

---

## 2. Rôles & Matrice des Permissions (RBAC)

| Rôle | Libellé | Permissions Accordées |
| :--- | :--- | :--- |
| **`super_admin`** | Super Administrateur | Toutes les permissions (`*`), y compris `users.manage`. |
| **`admin`** | Administrateur | `services.manage`, `projects.manage`, `quotes.manage`, `messages.manage`, `articles.manage`. |
| **`editor`** | Éditeur / Rédacteur | `projects.manage`, `articles.manage`. |

---

## 3. Endpoints d'Authentification V1

### `POST /api/v1/auth/register`
* **Accès** : Public (Rate limit: 10 req/min).
* **Paramètres** : `name`, `email`, `password`, `password_confirmation`.
* **Réponse (201)** : `{ "success": true, "data": { "user": {...}, "token": "...", "token_type": "Bearer" } }`

### `POST /api/v1/auth/login`
* **Accès** : Public (Rate limit: 5 req/min).
* **Paramètres** : `email`, `password`, `device_name` (optionnel).
* **Réponse (200)** : `{ "success": true, "data": { "user": {...}, "token": "...", "token_type": "Bearer" } }`

### `GET /api/v1/auth/me`
* **Accès** : Authentifié (`auth:sanctum`).
* **Réponse (200)** : `{ "success": true, "data": { "user": { "id", "name", "email", "role", "role_label", "permissions": [...] } } }`

### `POST /api/v1/auth/logout`
* **Accès** : Authentifié (`auth:sanctum`).
* **Action** : Supprime le token d'accès courant.
* **Réponse (200)** : `{ "success": true, "message": "Déconnexion effectuée avec succès." }`

### `POST /api/v1/auth/forgot-password`
* **Accès** : Public (Rate limit: 5 req/min).
* **Paramètres** : `email`.

### `POST /api/v1/auth/reset-password`
* **Accès** : Public (Rate limit: 5 req/min).
* **Paramètres** : `token`, `email`, `password`, `password_confirmation`.
