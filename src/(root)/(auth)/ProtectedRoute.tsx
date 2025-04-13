// REACT-AUTH
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'

// REACT
import React, { JSX } from 'react'

// REACT-DOM
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    element: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const isAuthenticated = useIsAuthenticated();

    return isAuthenticated ? element : <Navigate to="/login" replace/>;
};

export default ProtectedRoute