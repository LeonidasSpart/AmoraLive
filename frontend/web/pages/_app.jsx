// pages/_app.js

import React from 'react';
import Head from 'next/head';
import '../styles.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>AmoraLive — Meaningful Connections</title>

        <meta
          name="description"
          content="AmoraLive — connect, chat, match and share meaningful moments."
        />

        <meta
          name="theme-color"
          content="#070616"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta
          name="mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta
          name="apple-mobile-web-app-title"
          content="Amora"
        />

        <link
          rel="icon"
          href="/favicon.ico"
          sizes="any"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="64x64"
          href="/favicon-64.png"
        />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        <link
          rel="manifest"
          href="/manifest.webmanifest"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content="AmoraLive"
        />

        <meta
          property="og:title"
          content="AmoraLive — Meaningful Connections"
        />

        <meta
          property="og:description"
          content="Meet people, feel the connection and share meaningful moments with AmoraLive."
        />

        <meta
          property="og:image"
          content="/og-image.png"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="AmoraLive — Meaningful Connections"
        />

        <meta
          name="twitter:description"
          content="Meet people, feel the connection and share meaningful moments with AmoraLive."
        />

        <meta
          name="twitter:image"
          content="/og-image.png"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
