// pages/_app.jsx
import React from 'react';
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return React.createElement(React.Fragment, null, [
    React.createElement(Script, { key: 'livekit', src: 'https://cdn.jsdelivr.net/npm/livekit-client@2.15.4/dist/livekit-client.umd.min.js', strategy: 'afterInteractive' }),
    React.createElement(Component, { key: 'page', ...pageProps })
  ]);
}
