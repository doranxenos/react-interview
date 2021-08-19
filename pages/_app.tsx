import { AppProps } from 'next/app';
import React from 'react';
import '../styles.scss';

function FEExerciseApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default FEExerciseApp;
