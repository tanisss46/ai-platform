import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { store } from '@/store/store';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>AI Platform</title>
        <meta name="description" content="The ultimate AI platform for all your creative needs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isClient && (
        <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            <ThemeProvider>
              <Component {...pageProps} />
            </ThemeProvider>
          </ReduxProvider>
        </QueryClientProvider>
      )}
    </>
  );
}
