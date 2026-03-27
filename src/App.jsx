import React, { useMemo, useEffect } from 'react';
import Router from './Router';
import { Toaster } from 'sileo';
import { useTheme } from './hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileAsync, selectIsInitialized } from './redux/auth/authSlice';
import { useLocation } from 'react-router-dom';

const FullScreenLoader = () => (
  <div className='flex justify-center items-center h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-900'></div>
  </div>
);

const LocationWatcher = () => {
  const location = useLocation();

  useEffect(() => {
    const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
    if (!authPaths.includes(location.pathname)) {
      sessionStorage.setItem("last_valid_page", location.pathname + location.search);
    }
  }, [location]);

  return null;
};

const App = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    dispatch(fetchProfileAsync());
  }, [dispatch]);

  const memoizedToaster = useMemo(() => <Toaster
    position="top-center"
    options={{
      fill: isDark ? '#efefef' : '#2d3436',
      styles: {
        title: isDark ? 'text-charcoal!' : 'text-white!',
        description: isDark ? 'text-gray-800!' : 'text-gray-400!',
      },
      duration: 5000,
    }}
  />,
    [isDark]
  );

  if (!isInitialized) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <LocationWatcher />
      <Router />
      {memoizedToaster}
    </>
  );
};

export default App;