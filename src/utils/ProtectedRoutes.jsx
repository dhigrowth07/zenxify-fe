import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

// Public route
export const PublicRoute = ({ children = null }) => {
  return children ? children : <Outlet />;
};

// Protected route
// Redirect authenticated users

