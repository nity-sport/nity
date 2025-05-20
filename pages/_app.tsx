// pages/_app.tsx
import type { AppProps } from 'next/app';
import '../styles/theme-config.css';
import Layout from '../components/layout/Layout';
import '../styles/globals.css';


export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
