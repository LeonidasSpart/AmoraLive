// pages/_app.jsx
import React from 'react';

export default function App({ Component, pageProps }) {
  return React.createElement(Component, pageProps);
}
