import React, { useMemo } from 'react';
import Router from './Router';
import { Toaster } from 'sileo';
import { useTheme } from './hooks/useTheme';

const App = () => {
  const { isDark } = useTheme();

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

  return (
    <>
      <Router />
      {memoizedToaster}
    </>
  );
};

export default App;