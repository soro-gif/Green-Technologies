import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { HealthPage } from '../pages/HealthPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardTestPage } from '../pages/DashboardTestPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Application Routes Configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HealthPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard-test',
        element: (
          <ProtectedRoute>
            <DashboardTestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
