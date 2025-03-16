import { Provider as ReduxProvider } from 'react-redux';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';

// Define types for pages with layouts
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};
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

export default function App({ Component, pageProps }: AppPropsWithLayout) {
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
              {Component.getLayout ? (
                Component.getLayout(<Component {...pageProps} />)
              ) : (
                <Component {...pageProps} />
              )}
            </ThemeProvider>
          </ReduxProvider>
        </QueryClientProvider>
      )}
    </>
  );
}
