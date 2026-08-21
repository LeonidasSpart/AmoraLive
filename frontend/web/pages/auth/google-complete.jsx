import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AuthLayout from '../../components/AuthLayout';

export default function GoogleComplete() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { accessToken, refreshToken, userId, role } = router.query;
    if (!accessToken) return;
    localStorage.setItem('accessToken', String(accessToken));
    if (refreshToken) localStorage.setItem('refreshToken', String(refreshToken));
    if (userId) localStorage.setItem('userId', String(userId));
    router.replace(role === 'admin' || role === 'superadmin' ? '/admin' : '/discover');
  }, [router.isReady, router.query]);

  return (
    <AuthLayout
      eyebrow="GOOGLE"
      title="Connecting you to Amora."
      subtitle="Please wait while we securely finish signing you in."
    >
      <div className="amora-loading-state">
        <span className="amora-spinner" aria-hidden="true" />
        <p>Finishing Google sign-in…</p>
      </div>
    </AuthLayout>
  );
}
