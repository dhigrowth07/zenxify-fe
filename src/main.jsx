import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { injectStore } from './services/api';
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

injectStore(store);

const FullScreenLoader = () => (
  <div className='flex justify-center items-center h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-900'></div>
  </div>
);

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={<FullScreenLoader />} persistor={persistor}>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </StrictMode>
  )
}
