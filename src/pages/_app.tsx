import { AppProps } from 'next/app';
import { MainLayout } from '@/components/layouts/MainLayout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default MyApp;
