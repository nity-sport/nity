// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/theme-config.css';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </>
  );
}
