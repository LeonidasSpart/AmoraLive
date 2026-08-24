const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { z } = require('zod');
const { signAccessToken, signRefreshToken } = require('../lib');
const auth = require('../middleware/auth');
const { logSecurityEvent } = require('../lib/security');

function calculateAge(dob) {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const month = now.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

module.exports = (prisma) => {
  const router = require('express').Router();
  const appUrl = () => (process.env.APP_URL || 'https://amoramatch.one').replace(/\/+$/, '');
  const googleRedirectUri = () => (process.env.GOOGLE_REDIRECT_URI || 'https://api.amoramatch.one/auth/google/callback').replace(/\/+$/, '');
  const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8),
    dateOfBirth: z.string().transform(d => new Date(d))
  });

  const mailer = process.env.EMAIL_HOST ? nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true',
    auth: process.env.EMAIL_USER ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined
  }) : null;

  async function sendVerificationEmail(user) {
    if (!mailer) return false;
    const token = jwt.sign({ id: user.id, purpose: 'email_verification' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const verifyUrl = `${appUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your AmoraLive account',
      text: `Verify your AmoraLive account: ${verifyUrl}`,
      html: `<p>Welcome to AmoraLive.</p><p><a href="${verifyUrl}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`
    });
    return true;
  }

  function sessionResponse(user) {
    return {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: { id: user.id, username: user.username, display_name: user.display_name, level: user.level, role: user.role, membership_tier: user.membership_tier }
    };
  }

  async function createSession(user, req) {
    const refreshToken = signRefreshToken(user);
    await prisma.session.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        device_info: req?.headers['user-agent']?.slice(0, 255) || null,
        ip_address: (req?.headers['x-forwarded-for']?.split(',')[0].trim() || req?.ip || null)
      }
    });
    return {
      accessToken: signAccessToken(user),
      refreshToken,
      user: { id: user.id, username: user.username, display_name: user.display_name, level: user.level, role: user.role, membership_tier: user.membership_tier }
    };
  }

  router.post('/register', async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });
    const { email, username, password, dateOfBirth } = result.data;
    if (Number.isNaN(dateOfBirth.getTime())) return res.status(400).json({ error: 'Invalid date of birth.' });
    if (calculateAge(dateOfBirth) < 18) return res.status(403).json({ error: 'You must be 18 or older.' });

    try {
      const hashed = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email: email.toLowerCase(), username, password_hash: hashed, date_of_birth: dateOfBirth, display_name: username, age_verified: true }
      });
      await prisma.wallet.create({ data: { user_id: user.id, balance: 0 } });
      const verificationSent = await sendVerificationEmail(user).catch(err => { console.error('Verification email failed:', err.message); return false; });
      res.status(201).json({ id: user.id, message: verificationSent ? 'Verification email sent.' : 'Account created. Email verification is temporarily unavailable.' });
    } catch (e) {
      res.status(400).json({ error: 'Email or username already exists.' });
    }
  });

  router.get('/verify-email', async (req, res) => {
    try {
      const decoded = jwt.verify(String(req.query.token || ''), process.env.JWT_SECRET);
      if (decoded.purpose !== 'email_verification') throw new Error('Invalid token');
      await prisma.user.update({ where: { id: decoded.id }, data: { is_verified: true } });
      res.redirect(`${appUrl()}/login?verified=1`);
    } catch {
      res.status(400).send('Verification link is invalid or expired.');
    }
  });

  router.post('/resend-verification', async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { email: String(req.body.email || '').toLowerCase() } });
      if (!user || user.is_verified) return res.json({ success: true });
      await sendVerificationEmail(user);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to send verification email' });
    }
  });

  router.post('/login', async (req, res) => {
    const identifier = String(req.body.identifier || '').trim();
    const password = String(req.body.password || '');
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }] } });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await logSecurityEvent(prisma, {
        action: 'login_failed',
        targetType: 'auth',
        targetId: crypto.createHash('sha256').update(identifier.toLowerCase()).digest('hex').slice(0, 24),
        details: { reason: 'invalid_credentials', requestId: req.requestId },
        ip: req.clientIp
      });
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (!user.is_active) {
      await logSecurityEvent(prisma, {
        userId: user.id,
        action: 'login_blocked',
        targetType: 'user',
        targetId: user.id,
        details: { reason: 'account_suspended', requestId: req.requestId },
        ip: req.clientIp
      });
      return res.status(403).json({ error: 'Account suspended.' });
    }
    const session = await createSession(user, req);
    await logSecurityEvent(prisma, {
      userId: user.id,
      action: 'login_success',
      targetType: 'user',
      targetId: user.id,
      details: { requestId: req.requestId, device: req.headers['user-agent']?.slice(0, 180) || null },
      ip: req.clientIp
    });
    res.json(session);
  });

  // ---------- Change password ----------
  // Keeps password changes server-side, revokes every existing refresh session
  // after success, and never stores or logs plaintext passwords.
  router.post('/change-password', auth, async (req, res) => {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (newPassword.length < 10) {
      return res.status(400).json({ error: 'New password must be at least 10 characters.' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'Choose a different password.' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) return res.status(404).json({ error: 'Account not found.' });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        await logSecurityEvent(prisma, { userId: user.id, action: 'password_change_failed', targetType: 'user', targetId: user.id, details: { reason: 'invalid_current_password', requestId: req.requestId }, ip: req.clientIp });
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { password_hash: passwordHash } }),
        prisma.session.deleteMany({ where: { user_id: user.id } })
      ]);

      await logSecurityEvent(prisma, { userId: user.id, action: 'password_changed', targetType: 'user', targetId: user.id, details: { requestId: req.requestId, sessionsRevoked: true }, ip: req.clientIp });
      res.json({ success: true, sessionsRevoked: true });
    } catch (e) {
      console.error('Password change error:', e);
      res.status(500).json({ error: 'Unable to change password.' });
    }
  });

  // Google OAuth: existing users can log in immediately. New users are returned
  // a short-lived completion token because DOB/username are required by Amora.
  // The flow uses a signed state value bound to a short-lived HttpOnly cookie to
  // protect the redirect flow against CSRF.
  // `platform=mobile` lets the native app opt into a deep-link redirect
  // (amora://auth-callback) instead of the web app's /auth/google-complete
  // page once the OAuth round-trip finishes. The choice is bound into the
  // signed state token so it can't be tampered with client-side.
  router.get('/google/start', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).send('Google authentication is not configured');
    const platform = req.query.platform === 'mobile' ? 'mobile' : 'web';
    const state = crypto.randomBytes(32).toString('hex');
    const stateToken = jwt.sign({ purpose: 'google_oauth_state', state, platform }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.cookie('amora_google_state', stateToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/auth/google'
    });
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: googleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: stateToken
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  router.get('/google/callback', async (req, res) => {
    try {
      if (!req.query.code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) throw new Error('Google authentication is not configured');
      const stateToken = String(req.query.state || '');
      const cookieHeader = String(req.headers.cookie || '');
      const cookieMatch = cookieHeader.match(/(?:^|;\s*)amora_google_state=([^;]+)/);
      const cookieState = cookieMatch ? decodeURIComponent(cookieMatch[1]) : '';
      const state = jwt.verify(stateToken, process.env.JWT_SECRET);
      const cookieStateDecoded = jwt.verify(cookieState, process.env.JWT_SECRET);
      if (state.purpose !== 'google_oauth_state' || cookieStateDecoded.purpose !== 'google_oauth_state' || state.state !== cookieStateDecoded.state) {
        throw new Error('Invalid Google OAuth state');
      }
      res.setHeader('Set-Cookie', 'amora_google_state=; Max-Age=0; Path=/auth/google; Secure; HttpOnly; SameSite=Lax');
      const isMobile = state.platform === 'mobile';
      const failureRedirect = isMobile ? 'amora://auth-callback?error=google_auth_failed' : `${appUrl()}/login?error=google_auth_failed`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: String(req.query.code), client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: googleRedirectUri(), grant_type: 'authorization_code' }) });
      const tokens = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokens.error_description || 'Google token exchange failed');
      const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      const profile = await profileRes.json();
      if (!profile.email || !profile.email_verified) throw new Error('Google email is not verified');

      const existing = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });
      if (existing) {
        if (!existing.is_active) {
          return res.redirect(isMobile ? 'amora://auth-callback?error=account_suspended' : `${appUrl()}/login?error=account_suspended`);
        }
        const session = await createSession(existing, req);
        const params = new URLSearchParams({ accessToken: session.accessToken, refreshToken: session.refreshToken, userId: existing.id, role: existing.role });
        return res.redirect(isMobile ? `amora://auth-callback?${params}` : `${appUrl()}/auth/google-complete?${params}`);
      }

      const completion = jwt.sign({ purpose: 'google_signup', email: profile.email.toLowerCase(), name: profile.name || profile.email.split('@')[0] }, process.env.JWT_SECRET, { expiresIn: '10m' });
      if (isMobile) {
        return res.redirect(`amora://auth-callback?google=${encodeURIComponent(completion)}`);
      }
      res.redirect(`${appUrl()}/register?google=${encodeURIComponent(completion)}`);
    } catch (e) {
      console.error('Google OAuth error:', e);
      // We don't know the platform if state verification itself failed, so
      // fall back to the web login page rather than guessing a deep link.
      res.redirect(`${appUrl()}/login?error=google_auth_failed`);
    }
  });

  router.post('/google/complete', async (req, res) => {
    try {
      const decoded = jwt.verify(String(req.body.completionToken || ''), process.env.JWT_SECRET);
      if (decoded.purpose !== 'google_signup') throw new Error('Invalid token');
      const username = String(req.body.username || '').trim();
      const dateOfBirth = new Date(req.body.dateOfBirth);
      if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username)) return res.status(400).json({ error: 'Invalid username' });
      if (Number.isNaN(dateOfBirth.getTime()) || calculateAge(dateOfBirth) < 18) return res.status(403).json({ error: 'You must be 18 or older.' });
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
      const user = await prisma.user.create({ data: { email: decoded.email, username, password_hash: passwordHash, date_of_birth: dateOfBirth, display_name: decoded.name, age_verified: true, is_verified: true } });
      await prisma.wallet.create({ data: { user_id: user.id, balance: 0 } });
      res.status(201).json(await createSession(user, req));
    } catch (e) {
      res.status(400).json({ error: 'Unable to complete Google registration. Username may already be taken.' });
    }
  });

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      if (decoded.type !== 'refresh') throw new Error('Invalid token');
      const session = await prisma.session.findUnique({ where: { refresh_token: refreshToken } });
      if (!session || session.expires_at < new Date()) return res.status(401).json({ error: 'Invalid refresh token.' });
      const user = await prisma.user.findUnique({ where: { id: session.user_id } });
      if (!user?.is_active) return res.status(403).json({ error: 'Account suspended.' });
      res.json({ accessToken: signAccessToken(user) });
    } catch {
      res.status(401).json({ error: 'Invalid refresh token.' });
    }
  });

  router.post('/logout', async (req, res) => {
    await prisma.session.deleteMany({ where: { refresh_token: req.body.refreshToken || '' } });
    res.json({ success: true });
  });

  return router;
};
