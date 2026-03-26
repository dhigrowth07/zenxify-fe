import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "./components/shared/Loading";
import ScrollToTop from "./components/shared/ScrollToTop";
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import { PublicRoute } from './utils/ProtectedRoutes';
import LoginPage from './pages/authpages/LoginPage';
import RegisterPage from './pages/authpages/RegisterPage';
import ForgotPasswordPage from './pages/authpages/ForgotPasswordPage';
import ResetPasswordPage from './pages/authpages/ResetPasswordPage';
import EmailVerificationPage from './pages/authpages/EmailVerificationPage';

const Router = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />

      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route element={<PublicRoute />}>
          <Route element={<UserLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Suspense>
  );
};

export default Router;
