import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "./components/shared/Loading";
import ScrollToTop from "./components/shared/ScrollToTop";
import UserLayout from './layouts/UserLayout';
import HomePage from './pages/HomePage';
import { PublicRoute } from './utils/ProtectedRoutes';

const Router = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />

      <Routes>
       

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
