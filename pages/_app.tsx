// pages/_app.tsx
import type { AppProps } from 'next/app';
import type { NextPage } from 'next';
import Head from 'next/head';
import '../styles/theme-config.css';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';
import { AuthProvider } from '../src/contexts/AuthContext';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? (page => <Layout>{page}</Layout>);

  return (
    <>
      <AuthProvider>
        <Head>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          />
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
            rel='stylesheet'
          />
        </Head>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}
