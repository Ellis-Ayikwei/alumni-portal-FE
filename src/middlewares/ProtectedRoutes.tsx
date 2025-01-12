// ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { IRootState } from '../store';
import { access } from 'fs';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'


interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;

};

export default ProtectedRoute;

