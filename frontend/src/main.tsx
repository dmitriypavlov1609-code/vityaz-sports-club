import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Создание React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1F2937',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              style: {
                background: '#059669',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#059669',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#DC2626',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#DC2626',
              },
            },
            loading: {
              style: {
                background: '#1F2937',
              },
              iconTheme: {
                primary: '#DC2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
