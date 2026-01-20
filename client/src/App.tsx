import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Best for server state
import { Toaster } from 'react-hot-toast'; // For notifications
import { AuthProvider } from './features/auth/authContext.tsx'
import { BrowserRouter } from 'react-router-dom';

import './App.css'
import { CssBaseline } from '@mui/material';
import AppRoutes from './routes/AppRoutes.tsx';
import Loader from './components/Loader.tsx';
import { Provider } from 'react-redux';
import { store } from './store';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [count, setCount] = useState(0)
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || ""}>
        <Provider store={store}>
          <AuthProvider>
            <BrowserRouter>
              <CssBaseline />
              <AppRoutes />
            </BrowserRouter>
            <Toaster position="top-right" />
          </AuthProvider>
        </Provider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
