# Architecture de la Base de Données — GREEN TECHNOLOGIES

## 1. Entités & Rôles Métier

| Entité | Table | Description |
| :--- | :--- | :--- |
| **Category** | `categories` | Domaines d'activités majeurs (Eau & Hydraulique, Énergie Solaire, Agrotechnologies, BTP). |
| **Service** | `services` | Solutions et prestations techniques proposées par domaine. |
| **Project** | `projects` | Réalisations livrées, études de cas et références de chantiers. |
| **QuoteRequest** | `quote_requests` | Demandes d'études et de devis générées par les prospects. |
| **ContactMessage** | `contact_messages` | Messages transmis via le formulaire de contact général. |
| **Testimonial** | `testimonials` | Retours d'expérience et avis vérifiés des clients/partenaires. |
| **Article** | `articles` | Publications d'actualités, innovations techniques et RSE. |
| **User** | `users` | Administrateurs et gestionnaires de l'application. |

---

## 2. Modèle Conceptuel des Données (MCD)

```text
Category (1:N) ───< Service
Category (1:N) ───< Project
Category (1:N) ───< QuoteRequest
Category (1:N) ───< Article
Service  (1:N) ───< Project (optionnel)
Service  (1:N) ───< QuoteRequest (optionnel)
Project  (1:N) ───< Testimonial (optionnel)
User     (1:N) ───< Article (Auteur)
```

---

## 3. Enums PHP 8.4 Typés

* `ProjectStatus` : `draft`, `published`, `archived`
* `QuoteStatus` : `pending`, `in_review`, `quoted`, `accepted`, `rejected`
* `MessageStatus` : `unread`, `read`, `replied`, `archived`
* `ArticleStatus` : `draft`, `published`, `archived`
* `UserRole` : `super_admin`, `admin`, `editor`

---

## 4. Stratégie d'Identification & Précision Financière

* **Clés primaires** : `BIGINT UNSIGNED AUTO_INCREMENT` (`id`) pour des jointures rapides et optimisées.
* **Slugs publics** : Indexés et uniques (`slug`) pour le SEO et le routage frontend.
* **Références de devis** : Code unique aléatoire horodaté (ex: `DEV-ABC12345`).
* **Montants financiers** : `DECIMAL(15, 2)` pour éviter toute approximation de calcul à virgule flottante.

---

## 5. Procédure de Réinitialisation en Développement

> ⚠️ **ATTENTION (DEV ONLY)** : La commande suivante efface l'intégralité des données et ré-exécute les migrations et seeders. Ne jamais lancer en production.

```bash
cd backend
php artisan migrate:fresh --seed
```
