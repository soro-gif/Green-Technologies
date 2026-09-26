import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { UserLayout } from '../layouts/UserLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Spinner } from '../components/ui/Spinner';
import { ErrorPage } from '../pages/ErrorPage';

// Minimal Suspense Wrapper for fast chunk loading
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full py-16">
      <Spinner size="lg" />
    </div>
  );
}

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// =========================================================================
// PUBLIC PAGES (VISITEUR)
// =========================================================================
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const DomainsPage = lazy(() => import('../pages/DomainsPage').then((m) => ({ default: m.DomainsPage })));
const DomainDetailPage = lazy(() => import('../pages/DomainDetailPage').then((m) => ({ default: m.DomainDetailPage })));
const ServicesPage = lazy(() => import('../pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('../pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const QuoteRequestPage = lazy(() => import('../pages/QuoteRequestPage').then((m) => ({ default: m.QuoteRequestPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const ArticlesPage = lazy(() => import('../pages/ArticlesPage').then((m) => ({ default: m.ArticlesPage })));
const ArticleDetailPage = lazy(() => import('../pages/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const HealthPage = lazy(() => import('../pages/HealthPage').then((m) => ({ default: m.HealthPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// =========================================================================
// AUTH PAGES (CONNEXION & INSCRIPTION)
// =========================================================================
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// =========================================================================
// USER PORTAL PAGES (UTILISATEUR AUTHENTIFIÉ - « MON ESPACE »)
// =========================================================================
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })));
const UserQuotesPage = lazy(() => import('../pages/user/UserQuotesPage').then((m) => ({ default: m.UserQuotesPage })));
const UserNewQuotePage = lazy(() => import('../pages/user/UserNewQuotePage').then((m) => ({ default: m.UserNewQuotePage })));
const UserProfilePage = lazy(() => import('../pages/user/UserProfilePage').then((m) => ({ default: m.UserProfilePage })));

// =========================================================================
// ADMIN BACKOFFICE PAGES (ADMINISTRATEUR - ACCÈS STRICT)
// =========================================================================
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminQuotesPage = lazy(() => import('../pages/admin/AdminQuotesPage').then((m) => ({ default: m.AdminQuotesPage })));
const AdminMessagesPage = lazy(() => import('../pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })));
const AdminProjectsPage = lazy(() => import('../pages/admin/AdminProjectsPage').then((m) => ({ default: m.AdminProjectsPage })));
const AdminTestimonialsPage = lazy(() => import('../pages/admin/AdminTestimonialsPage').then((m) => ({ default: m.AdminTestimonialsPage })));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminArticlesPage = lazy(() => import('../pages/admin/AdminArticlesPage').then((m) => ({ default: m.AdminArticlesPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const DashboardTestPage = lazy(() => import('../pages/DashboardTestPage').then((m) => ({ default: m.DashboardTestPage })));

/**
 * Complete Frontend Application Routes Configuration (3 Tiers: Visiteur -> Utilisateur -> Administrateur)
 */
export const router = createBrowserRouter([
  // 1. PUBLIC PORTAL & CATALOG ROUTES (Visiteur)
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(HomePage),
      },
      {
        path: 'domaines',
        element: withSuspense(DomainsPage),
      },
      {
        path: 'domaines/:slug',
        element: withSuspense(DomainDetailPage),
      },
      {
        path: 'services',
        element: withSuspense(ServicesPage),
      },
      {
        path: 'services/:slug',
        element: withSuspense(ServiceDetailPage),
      },
      // Réalisations (URL officielle)
      {
        path: 'realisations',
        element: withSuspense(ProjectsPage),
      },
      {
        path: 'realisations/:slug',
        element: withSuspense(ProjectDetailPage),
      },
      // Redirections compatibilité anciens liens
      {
        path: 'projets',
        element: <Navigate to="/realisations" replace />,
      },
      {
        path: 'projets/:slug',
        element: <Navigate to="/realisations" replace />,
      },
      {
        path: 'devis',
        element: withSuspense(QuoteRequestPage),
      },
      {
        path: 'contact',
        element: withSuspense(ContactPage),
      },
      // Actualités (URL officielle)
      {
        path: 'actualites',
        element: withSuspense(ArticlesPage),
      },
      {
        path: 'actualites/:slug',
        element: withSuspense(ArticleDetailPage),
      },
      // Redirection compatibilité anciens liens
      {
        path: 'articles',
        element: <Navigate to="/actualites" replace />,
      },
      {
        path: 'articles/:slug',
        element: <Navigate to="/actualites" replace />,
      },
      // Authentification (URLs françaises officielles)
      {
        path: 'connexion',
        element: withSuspense(LoginPage),
      },
      {
        path: 'inscription',
        element: withSuspense(RegisterPage),
      },
      // Redirections compatibilité anciens liens
      {
        path: 'login',
        element: <Navigate to="/connexion" replace />,
      },
      {
        path: 'admin/login',
        element: <Navigate to="/connexion" replace />,
      },
      {
        path: 'register',
        element: <Navigate to="/inscription" replace />,
      },
      {
        path: 'health',
        element: withSuspense(HealthPage),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },

  // 2. USER PERSONAL SPACE ROUTES (« Mon Espace » - Utilisateur Authentifié)
  {
    path: '/mon-espace',
    element: (
      <ProtectedRoute requiredRole={['user', 'admin', 'super_admin', 'editor']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(UserDashboardPage),
      },
      {
        path: 'mes-demandes',
        element: withSuspense(UserQuotesPage),
      },
      {
        path: 'nouveau-devis',
        element: withSuspense(UserNewQuotePage),
      },
      {
        path: 'profil',
        element: withSuspense(UserProfilePage),
      },
    ],
  },
  {
    path: '/utilisateur',
    element: <Navigate to="/mon-espace" replace />,
  },

  // 3. PROTECTED ADMIN BACKOFFICE ROUTES (Administrateur - super_admin, admin, editor)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole={['super_admin', 'admin', 'editor']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(AdminDashboardPage),
      },
      // URLs françaises officielles du backoffice
      {
        path: 'tableau-de-bord',
        element: withSuspense(AdminDashboardPage),
      },
      {
        path: 'devis',
        element: withSuspense(AdminQuotesPage),
      },
      {
        path: 'messages',
        element: withSuspense(AdminMessagesPage),
      },
      {
        path: 'domaines',
        element: withSuspense(AdminCategoriesPage),
      },
      {
        path: 'services',
        element: withSuspense(AdminServicesPage),
      },
      {
        path: 'projets',
        element: withSuspense(AdminProjectsPage),
      },
      {
        path: 'temoignages',
        element: withSuspense(AdminTestimonialsPage),
      },
      {
        path: 'actualites',
        element: withSuspense(AdminArticlesPage),
      },
      {
        path: 'utilisateurs',
        element: (
          <ProtectedRoute requiredRole="super_admin">
            {withSuspense(AdminUsersPage)}
          </ProtectedRoute>
        ),
      },
      // Redirections compatibilité anciens liens anglais
      {
        path: 'dashboard',
        element: <Navigate to="/admin/tableau-de-bord" replace />,
      },
      {
        path: 'quotes',
        element: <Navigate to="/admin/devis" replace />,
      },
      {
        path: 'categories',
        element: <Navigate to="/admin/domaines" replace />,
      },
      {
        path: 'projects',
        element: <Navigate to="/admin/projets" replace />,
      },
      {
        path: 'testimonials',
        element: <Navigate to="/admin/temoignages" replace />,
      },
      {
        path: 'articles',
        element: <Navigate to="/admin/actualites" replace />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="super_admin">
            <Navigate to="/admin/utilisateurs" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: 'diagnostic',
        element: withSuspense(DashboardTestPage),
      },
    ],
  },
]);

