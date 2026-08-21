import { Html, Head, Main, NextScript } from 'next/document';

// The LiveKit browser SDK is loaded from the CDN (per the production
// runbook) rather than bundled, so `window.LivekitClient` is available to
// any page that needs real-time video (live rooms, quick video match).
// This was previously never actually included anywhere, which silently
// broke live video across the app.
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"
          defer
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
