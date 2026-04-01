import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "./components/shared/Loading";
import ScrollToTop from "./components/shared/ScrollToTop";
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import { PublicRoute, ProtectedRoute } from './utils/ProtectedRoutes';
import LoginPage from './pages/authpages/LoginPage';
import RegisterPage from './pages/authpages/RegisterPage';
import ForgotPasswordPage from './pages/authpages/ForgotPasswordPage';
import ResetPasswordPage from './pages/authpages/ResetPasswordPage';
import EmailVerificationPage from './pages/authpages/EmailVerificationPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';

const Router = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />

      <Routes>
        <Route index element={<HomePage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Suspense>
  );
};


export default Router;
