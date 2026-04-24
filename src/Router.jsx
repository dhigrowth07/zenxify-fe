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
import VideoEditorLayout from './layouts/VideoEditorLayout';
import DashboardPage from './pages/DashboardPage';
import AccountPage from './pages/settings/AccountPage';
import GeneralPage from './pages/settings/GeneralPage';
import ProjectCreationPage from './pages/videoediting_pages/ProjectCreationPage';
import VideoUploadPage from './pages/videoediting_pages/VideoUploadPage';
import ProjectListingPage from './pages/videoediting_pages/ProjectListingPage';
import BillingPage from './pages/settings/BillingPage';
import ColourGradePage from './pages/videoediting_pages/ColourGradePage';
import ExportPage from './pages/videoediting_pages/ExportPage';
import VadTrimingPage from './pages/videoediting_pages/VadTrimingPage';

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
                        <Route path="/projects" element={<ProjectListingPage />} />
                        <Route path="/video-editor/create" element={<ProjectCreationPage />} />

                        {/* Video Editor Workflow Routes */}
                        <Route element={<VideoEditorLayout />}>
                            <Route path="/video-editor/upload" element={<VideoUploadPage />} />
                            <Route path="/video-editor/vad-triming/:id" element={<VadTrimingPage />} />
                            <Route path="/video-editor/grade/:id" element={<ColourGradePage />} />
                            <Route path="/video-editor/export/:id" element={<ExportPage />} />
                            {/* Other editing steps would go here */}
                        </Route>

                        <Route path="/settings/account" element={<AccountPage />} />
                        <Route path="/settings/general" element={<GeneralPage />} />
                        <Route path="/settings/billing" element={<BillingPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </Suspense>
    );
};


export default Router;
