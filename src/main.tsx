// REACT
import { StrictMode, useEffect } from 'react';

// REACT-DOM & REACT-ROUTER-DOM
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom';

// CONTEXT PROVIDER
import { LoadingProvider, useLoading } from '@/context/LoadingProvider.tsx';
import { ToastPrivder } from '@/context/ToastProvider.tsx';

// STYLE
import './index.css'

// AUTH
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';

// TOAST
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// PAGES
import Login from './(root)/(auth)/Login.tsx';
import NotFoundPage from './(root)/view/NotFoundPage.tsx';
import Index from './(root)/(tabs)/Index.tsx';
import ErrorPage from './(root)/view/ErrorPage.tsx';
import Profile from './(root)/(tabs)/Profile.tsx';
import Dashboard from './(root)/home/Dashboard.tsx';
import Campus from './(root)/home/Campus.tsx';
import CanvasRoot from './(root)/canvas/CanvasRoot.tsx';
import CanvasEditor from './(root)/canvas/CanvasEditor.tsx';
import ProtectedRoute from './(root)/(auth)/ProtectedRoute.tsx';
import GlobalLoadingIndicator from './(root)/view/GlobalLoadingIndicator.tsx';
import SystemUser from './(root)/home/SystemUser.tsx';
import AdminUser from './(root)/home/AdminUser.tsx';
import ListAnnouncement from './(root)/home/ListAnnouncement.tsx';
import CreateAnnouncement from './(root)/home/CreateAnnouncement.tsx';

function LoginWithGuard() {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <Login />;
}

const AppWrapper = () => {
  const { loading, message } = useLoading();

  return (
    <>
      {loading && <GlobalLoadingIndicator message={message} />}
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFoundPage />
  },
  {
    path: "/error",
    element: <ErrorPage />
  },
  {
    path: "/login",
    element: <LoginWithGuard />
  },
  {
    path: "/",
    element: <ProtectedRoute element={<Index />} />,
    children: [
      {
        index: true,
        element: <Navigate to="dashboard/overview" replace />
      },
      {
        path: "dashboard",
        children: [
          {
            path: "overview",
            element: <ProtectedRoute element={<Dashboard />}/>
          },
          {
            path: "reports"
          },
        ]
      },
      {
        path: "campus",
        children: [
          {
            path: "map",
            element: <ProtectedRoute element={<Campus />} />
          },
          {
            path: "location pins"
          },
        ]
      },
      {
        path: "users",
        children: [
          {
            path: "system users",
            element: <SystemUser />
          },
          {
            path: "admin users",
            element: <AdminUser />
          },
        ]
      },
      {
        path: "/profile/:id",
        element: <ProtectedRoute element={<Profile />} />
      },
      {
        path: "/announcement",
        children: [
          {
            path: "list all",
            element: <ProtectedRoute element={<ListAnnouncement />} />
          }
        ]
      }
    ]
  },

  {
    path: "/campus/root",
    element: <ProtectedRoute element={<CanvasRoot />} />
  },
  {
    path: "/campus/editor/:buildingID",
    element: <ProtectedRoute element={<CanvasEditor />} />
  },
])

const store = createStore({
  authName: '_auth',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider store={store}>
        <ToastPrivder>
          <AppWrapper />
        </ToastPrivder>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
)