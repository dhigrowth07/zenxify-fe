import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/auth/authSlice';

export const PublicRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();


  if (isAuthenticated) {
    const from = location.state?.from?.pathname || sessionStorage.getItem("last_valid_page") || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
