import type { NextPage } from 'next';
import Head from 'next/head';
import AppLayout from '../src/components/AppLayout';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>LegalMind AI - Legal Assistant Interface</title>
        <meta name="description" content="AI-powered legal assistant interface" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppLayout />
      </main>
    </>
  );
};

export default Home;