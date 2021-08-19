import Head from 'next/head';
import React from 'react';

import App from '../src/components/App';

export default function Home() {
  return (
    <>
      <Head>
        <title>React Frontend Exercise</title>
      </Head>
      <App />
    </>
  );
}
