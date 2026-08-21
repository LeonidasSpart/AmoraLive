import React from 'react';
import Head from 'next/head';
import '../styles.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>AmoraLive — Meaningful Connections</title>
        <meta name="description" content="AmoraLive — connect, chat, match and share meaningful moments." />
        <meta name="theme-color" content="#070616" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" sizes="64x64" href="/brand/favicon-64.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/brand/amora-mark-192.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
