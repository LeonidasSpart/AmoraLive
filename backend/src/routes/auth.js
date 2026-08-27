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

  const appUrl = () =>
    (process.env.APP_URL || 'https://amoramatch.one').replace(/\/+$/, '');

  const googleRedirectUri = () =>
    (
      process.env.GOOGLE_REDIRECT_URI ||
      'https://api.amoramatch.one/auth/google/callback'
    ).replace(/\/+$/, '');

  const appleNativeClientId = () =>
    process.env.APPLE_NATIVE_CLIENT_ID || 'one.amoramatch.app';

  const appleWebClientId = () =>
    process.env.APPLE_WEB_CLIENT_ID ||
    process.env.APPLE_SERVICE_ID ||
    '';

  const appleRedirectUri = () =>
    (
      process.env.APPLE_REDIRECT_URI ||
      `${process.env.API_URL || 'https://api.amoramatch.one'}/auth/apple/callback`
    ).replace(/\/+$/, '');

  const facebookRedirectUri = () =>
    (
      process.env.FACEBOOK_REDIRECT_URI ||
      `${process.env.API_URL || 'https://api.amoramatch.one'}/auth/facebook/callback`
    ).replace(/\/+$/, '');

  const facebookGraphVersion = () =>
    process.env.FACEBOOK_GRAPH_VERSION || 'v24.0';

  const appleKeysCache = {
    keys: null,
    expiresAt: 0
  };

  function timingSafeStringEqual(a, b) {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  function base64urlToBuffer(value) {
    return Buffer.from(
      String(value).replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );
  }

  async function getApplePublicKey(kid) {
    if (!appleKeysCache.keys || appleKeysCache.expiresAt < Date.now()) {
      const response = await fetch(
        'https://appleid.apple.com/auth/keys'
      );

      if (!response.ok) {
        throw new Error('Unable to load Apple signing keys');
      }

      const data = await response.json();

      appleKeysCache.keys = data.keys || [];
      appleKeysCache.expiresAt = Date.now() + 60 * 60 * 1000;
    }

    const jwk = appleKeysCache.keys.find(
      key => key.kid === kid && key.kty === 'RSA'
    );

    if (!jwk) {
      throw new Error('Apple signing key not found');
    }

    return crypto.createPublicKey({
      key: jwk,
      format: 'jwk'
    });
  }

  async function verifyAppleIdentityToken(
    identityToken,
    expectedNonce,
    audience
  ) {
    const parts = String(identityToken || '').split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid Apple identity token');
    }

    const header = JSON.parse(
      base64urlToBuffer(parts[0]).toString('utf8')
    );

    if (header.alg !== 'RS256' || !header.kid) {
      throw new Error('Unsupported Apple identity token');
    }

    const publicKey = await getApplePublicKey(header.kid);

    const decoded = jwt.verify(
      identityToken,
      publicKey,
      {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience:
          audience ||
          [
            appleNativeClientId(),
            appleWebClientId()
          ].filter(Boolean)
      }
    );

    if (expectedNonce) {
      const hashedNonce = crypto
        .createHash('sha256')
        .update(String(expectedNonce))
        .digest('hex');

      if (
        decoded.nonce !== hashedNonce &&
        decoded.nonce !== expectedNonce
      ) {
        throw new Error('Apple nonce validation failed');
      }
    }

    if (
      !decoded.sub ||
      decoded.email_verified === false
    ) {
      throw new Error(
        'Apple account email is not verified'
      );
    }

    return decoded;
  }

  function createAppleClientSecret(clientId) {
    const privateKey = String(
      process.env.APPLE_PRIVATE_KEY || ''
    ).replace(/\\n/g, '\n');

    if (
      !privateKey ||
      !process.env.APPLE_TEAM_ID ||
      !process.env.APPLE_KEY_ID
    ) {
      throw new Error(
        'Apple web authentication is not configured'
      );
    }

    return jwt.sign(
      {
        iss: process.env.APPLE_TEAM_ID,
        iat: Math.floor(Date.now() / 1000),
        exp:
          Math.floor(Date.now() / 1000) + 5 * 60,
        aud: 'https://appleid.apple.com',
        sub: clientId
      },
      privateKey,
      {
        algorithm: 'ES256',
        keyid: process.env.APPLE_KEY_ID
      }
    );
  }

  function getOAuthEncryptionKey() {
    const raw = String(
      process.env.OAUTH_TOKEN_ENCRYPTION_KEY || ''
    );

    if (!/^[a-f0-9]{64}$/i.test(raw)) {
      throw new Error(
        'OAUTH_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key'
      );
    }

    return Buffer.from(raw, 'hex');
  }

  function encryptOAuthToken(value) {
    if (!value) return null;

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      getOAuthEncryptionKey(),
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(String(value), 'utf8'),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    return `${iv.toString('base64url')}.${tag.toString(
      'base64url'
    )}.${encrypted.toString('base64url')}`;
  }

  function decryptOAuthToken(value) {
    if (!value) return null;

    const [
      ivRaw,
      tagRaw,
      encryptedRaw
    ] = String(value).split('.');

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getOAuthEncryptionKey(),
      Buffer.from(ivRaw, 'base64url')
    );

    decipher.setAuthTag(
      Buffer.from(tagRaw, 'base64url')
    );

    return Buffer.concat([
      decipher.update(
        Buffer.from(encryptedRaw, 'base64url')
      ),
      decipher.final()
    ]).toString('utf8');
  }

  async function exchangeAppleAuthorizationCode(
    code,
    clientId,
    redirectUri
  ) {
    if (!code) return null;

    const clientSecret =
      createAppleClientSecret(clientId);

    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      code: String(code),
      grant_type: 'authorization_code'
    };

    if (redirectUri) {
      body.redirect_uri = redirectUri;
    }

    const response = await fetch(
      'https://appleid.apple.com/auth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_description ||
        'Apple authorization code exchange failed'
      );
    }

    return data;
  }

  async function revokeAppleRefreshToken(
    refreshToken,
    clientId
  ) {
    if (!refreshToken) return;

    const clientSecret =
      createAppleClientSecret(clientId);

    await fetch(
      'https://appleid.apple.com/auth/revoke',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          token: refreshToken,
          token_type_hint: 'refresh_token'
        })
      }
    );
  }

  function createOAuthState(provider, platform) {
    const nonce = crypto
      .randomBytes(32)
      .toString('hex');

    return jwt.sign(
      {
        purpose: `${provider}_oauth_state`,
        state: crypto
          .randomBytes(24)
          .toString('hex'),
        nonce,
        platform
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '10m'
      }
    );
  }

  function setOAuthStateCookie(
    res,
    provider,
    stateToken,
    sameSite = 'Lax'
  ) {
    res.setHeader(
      'Set-Cookie',
      `amora_${provider}_state=${encodeURIComponent(
        stateToken
      )}; Max-Age=600; Path=/auth/${provider}; Secure; HttpOnly; SameSite=${sameSite}`
    );
  }

  function readOAuthStateCookie(
    req,
    provider
  ) {
    const cookieHeader = String(
      req.headers.cookie || ''
    );

    const cookieMatch =
      cookieHeader.match(
        new RegExp(
          `(?:^|;\\s*)amora_${provider}_state=([^;]+)`
        )
      );

    return cookieMatch
      ? decodeURIComponent(cookieMatch[1])
      : '';
  }

  function consumeOAuthState(
    provider,
    req,
    stateToken
  ) {
    const cookieState =
      readOAuthStateCookie(req, provider);

    const state = jwt.verify(
      String(stateToken || ''),
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const cookie = jwt.verify(
      String(cookieState || ''),
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (
      state.purpose !==
        `${provider}_oauth_state` ||
      cookie.purpose !==
        `${provider}_oauth_state` ||
      !timingSafeStringEqual(state.state, cookie.state) ||
      !timingSafeStringEqual(state.nonce, cookie.nonce) ||
      state.platform !== cookie.platform
    ) {
      throw new Error(
        `Invalid ${provider} OAuth state`
      );
    }

    return state;
  }

  async function createOAuthHandoff({
    provider,
    userId,
    providerAccountId,
    email,
    displayName,
    refreshTokenEncrypted
  }) {
    const rawCode = crypto
      .randomBytes(40)
      .toString('base64url');

    const codeHash = crypto
      .createHash('sha256')
      .update(rawCode)
      .digest('hex');

    await prisma.oAuthHandoff.create({
      data: {
        code_hash: codeHash,
        provider,
        user_id: userId || null,
        provider_account_id:
          providerAccountId || null,
        email: email || null,
        display_name: displayName || null,
        refresh_token_encrypted:
          refreshTokenEncrypted || null,
        expires_at: new Date(
          Date.now() + 5 * 60 * 1000
        )
      }
    });

    return rawCode;
  }

  async function findOrPrepareSocialUser({
    provider,
    providerAccountId,
    email,
    displayName,
    req
  }) {
    const existingIdentity =
      await prisma.oAuthAccount.findUnique({
        where: {
          provider_provider_account_id: {
            provider,
            provider_account_id:
              providerAccountId
          }
        },
        include: {
          user: true
        }
      });

    if (existingIdentity?.user) {
      if (!existingIdentity.user.is_active) {
        throw new Error('account_suspended');
      }

      return {
        userId: existingIdentity.user.id,
        provider,
        providerAccountId
      };
    }

    /*
     * Only auto-link when the provider itself
     * returned an email.
     *
     * If Facebook does not return an email,
     * we DO NOT fabricate one.
     *
     * The user will be asked for a real email
     * during the Amora account completion step.
     */
    if (email) {
      const existingEmail =
        await prisma.user.findUnique({
          where: {
            email: email.toLowerCase()
          }
        });

      if (existingEmail) {
        await prisma.oAuthAccount.create({
          data: {
            user_id: existingEmail.id,
            provider,
            provider_account_id:
              providerAccountId,
            email: email.toLowerCase()
          }
        });

        return {
          userId: existingEmail.id,
          provider,
          providerAccountId
        };
      }
    }

    return {
      userId: null,
      provider,
      providerAccountId,
      email: email
        ? email.toLowerCase()
        : null,
      displayName:
        displayName || null
    };
  }

  const registerSchema = z.object({
    email: z.string().email(),
    username: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8),
    dateOfBirth: z
      .string()
      .transform(d => new Date(d))
  });

  const mailer = process.env.EMAIL_HOST
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(
          process.env.EMAIL_PORT || 587
        ),
        secure:
          String(
            process.env.EMAIL_SECURE || ''
          ).toLowerCase() === 'true',
        auth: process.env.EMAIL_USER
          ? {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          : undefined
      })
    : null;

  async function sendVerificationEmail(user) {
    if (!mailer) return false;

    const token = jwt.sign(
      {
        id: user.id,
        purpose: 'email_verification'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    const verifyUrl =
      `${appUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;

    await mailer.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,
      to: user.email,
      subject:
        'Verify your AmoraLive account',
      text:
        `Verify your AmoraLive account: ${verifyUrl}`,
      html:
        `<p>Welcome to AmoraLive.</p>` +
        `<p><a href="${verifyUrl}">Verify your email address</a></p>` +
        `<p>This link expires in 24 hours.</p>`
    });

    return true;
  }

  async function sendAccountDeletionEmail(user) {
    if (!mailer) return false;

    const token = jwt.sign(
      {
        id: user.id,
        purpose: 'account_deletion'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30m'
      }
    );

    const deleteUrl =
      `${appUrl()}/auth/delete-account?token=${encodeURIComponent(token)}`;

    await mailer.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,
      to: user.email,
      subject:
        'Confirm deletion of your AmoraLive account',
      text:
        `Confirm account deletion: ${deleteUrl}`,
      html:
        `<p>We received a request to delete your AmoraLive account.</p>` +
        `<p><a href="${deleteUrl}">Confirm permanent account deletion</a></p>` +
        `<p>This confirmation link expires in 30 minutes. If you did not request this, ignore this message.</p>`
    });

    return true;
  }

  async function anonymizeDeletedAccount(userId) {
    const suffix =
      crypto.randomBytes(8).toString('hex');

    const appleIdentity =
      await prisma.oAuthAccount.findFirst({
        where: {
          user_id: userId,
          provider: 'apple'
        },
        select: {
          refresh_token_encrypted: true
        }
      });

    if (appleIdentity?.refresh_token_encrypted) {
      try {
        await revokeAppleRefreshToken(
          decryptOAuthToken(
            appleIdentity.refresh_token_encrypted
          ),
          appleNativeClientId()
        );
      } catch (e) {
        console.warn(
          'Apple token revocation during deletion failed:',
          e.message
        );
      }
    }

    await prisma.$transaction(async tx => {
      await tx.storyReaction.deleteMany({
        where: {
          OR: [
            { user_id: userId },
            { story: { user_id: userId } }
          ]
        }
      });

      await tx.storyView.deleteMany({
        where: {
          OR: [
            { viewer_id: userId },
            { story: { user_id: userId } }
          ]
        }
      });

      await tx.story.deleteMany({
        where: { user_id: userId }
      });

      await tx.message.deleteMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        }
      });

      await tx.callHistory.deleteMany({
        where: {
          OR: [
            { caller_id: userId },
            { receiver_id: userId }
          ]
        }
      });

      await tx.videoMatchSession.deleteMany({
        where: {
          OR: [
            { user_a_id: userId },
            { user_b_id: userId }
          ]
        }
      });

      await tx.follow.deleteMany({
        where: {
          OR: [
            { follower_id: userId },
            { following_id: userId }
          ]
        }
      });

      await tx.match.deleteMany({
        where: {
          OR: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      await tx.swipe.deleteMany({
        where: {
          OR: [
            { swiper_id: userId },
            { target_id: userId }
          ]
        }
      });

      await tx.block.deleteMany({
        where: {
          OR: [
            { blocker_id: userId },
            { blocked_id: userId }
          ]
        }
      });

      await tx.mute.deleteMany({
        where: {
          OR: [
            { muter_id: userId },
            { muted_id: userId }
          ]
        }
      });

      await tx.roomParticipant.deleteMany({
        where: { user_id: userId }
      });

      await tx.liveChatMessage.deleteMany({
        where: { user_id: userId }
      });

      await tx.notification.deleteMany({
        where: { user_id: userId }
      });

      await tx.dailyRewardStatus.deleteMany({
        where: { user_id: userId }
      });

      await tx.dailyRewardClaim.deleteMany({
        where: { user_id: userId }
      });

      await tx.xpTransaction.deleteMany({
        where: { user_id: userId }
      });

      await tx.missionProgress.deleteMany({
        where: { user_id: userId }
      });

      await tx.userCosmetic.deleteMany({
        where: { user_id: userId }
      });

      await tx.eventScore.deleteMany({
        where: { user_id: userId }
      });

      await tx.session.deleteMany({
        where: { user_id: userId }
      });

      await tx.oAuthAccount.deleteMany({
        where: { user_id: userId }
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          email:
            `deleted-${suffix}@deleted.amoramatch.invalid`,
          username:
            `deleted_${suffix}`,
          display_name: 'Deleted User',
          password_hash:
            await bcrypt.hash(
              crypto.randomBytes(32).toString('hex'),
              12
            ),
          bio: null,
          location: null,
          interests: [],
          languages: [],
          relationship_intent: null,
          gender: null,
          profile_photo: null,
          cover_photo: null,
          online_status: 'offline',
          privacy_settings: null,
          dating_preferences: null,
          notification_preferences: null,
          is_active: false,
          deleted_at: new Date()
        }
      });
    });
  }

  function sessionResponse(user) {
    return {
      accessToken: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        level: user.level,
        role: user.role,
        membership_tier: user.membership_tier
      }
    };
  }

  async function createSession(user, req) {
    const refreshToken = signRefreshToken(user);

    await prisma.session.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        device_info:
          req?.headers['user-agent']?.slice(
            0,
            255
          ) || null,
        ip_address:
          (
            req?.headers['x-forwarded-for']
              ?.split(',')[0]
              .trim() ||
            req?.ip ||
            null
          )
      }
    });

    return {
      accessToken: signAccessToken(user),
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        level: user.level,
        role: user.role,
        membership_tier: user.membership_tier
      }
    };
  }

  function isUniqueConstraintError(error) {
    return error?.code === 'P2002';
  }

  router.post('/register', async (req, res) => {
    const result =
      registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues
      });
    }

    const {
      email,
      username,
      password,
      dateOfBirth
    } = result.data;

    if (
      Number.isNaN(dateOfBirth.getTime())
    ) {
      return res.status(400).json({
        error: 'Invalid date of birth.'
      });
    }

    if (calculateAge(dateOfBirth) < 18) {
      return res.status(403).json({
        error: 'You must be 18 or older.'
      });
    }

    try {
      const hashed =
        await bcrypt.hash(password, 12);

      const user =
        await prisma.$transaction(async tx => {
          const created =
            await tx.user.create({
              data: {
                email: email.toLowerCase(),
                username,
                password_hash: hashed,
                date_of_birth: dateOfBirth,
                display_name: username,
                age_verified: true
              }
            });

          await tx.wallet.create({
            data: {
              user_id: created.id,
              balance: 0
            }
          });

          return created;
        });

      const verificationSent =
        await sendVerificationEmail(user)
          .catch(err => {
            console.error(
              'Verification email failed:',
              err.message
            );
            return false;
          });

      res.status(201).json({
        id: user.id,
        message: verificationSent
          ? 'Verification email sent.'
          : 'Account created. Email verification is temporarily unavailable.'
      });
    } catch (e) {
      console.error(
        'Registration error:',
        e
      );

      if (isUniqueConstraintError(e)) {
        return res.status(409).json({
          error:
            'Email or username already exists.'
        });
      }

      return res.status(503).json({
        error:
          'Amora is temporarily unable to create your account. Please try again shortly.'
      });
    }
  });

  router.get('/verify-email', async (req, res) => {
    try {
      const decoded = jwt.verify(
        String(req.query.token || ''),
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] }
      );

      if (
        decoded.purpose !==
        'email_verification'
      ) {
        throw new Error('Invalid token');
      }

      await prisma.user.update({
        where: { id: decoded.id },
        data: { is_verified: true }
      });

      res.redirect(
        `${appUrl()}/login?verified=1`
      );
    } catch {
      res.status(400).send(
        'Verification link is invalid or expired.'
      );
    }
  });

  router.post(
    '/resend-verification',
    async (req, res) => {
      try {
        const user =
          await prisma.user.findUnique({
            where: {
              email: String(
                req.body.email || ''
              ).toLowerCase()
            }
          });

        if (!user || user.is_verified) {
          return res.json({
            success: true
          });
        }

        await sendVerificationEmail(user);

        res.json({
          success: true
        });
      } catch (e) {
        res.status(500).json({
          error:
            'Unable to send verification email'
        });
      }
    }
  );

  router.post(
    '/request-account-deletion',
    async (req, res) => {
      const email = String(
        req.body.email || ''
      ).trim().toLowerCase();

      if (!email) {
        return res.status(400).json({
          error:
            'Email address is required.'
        });
      }

      const generic = {
        success: true,
        message:
          'If an Amora account exists for that email, a deletion confirmation link has been sent.'
      };

      try {
        const user =
          await prisma.user.findUnique({
            where: { email }
          });

        if (user && user.is_active) {
          const sent =
            await sendAccountDeletionEmail(
              user
            );

          if (!sent) {
            return res.status(503).json({
              error:
                'Account deletion email is temporarily unavailable. Please use in-app deletion from Settings.'
            });
          }
        }

        return res.json(generic);
      } catch (e) {
        console.error(
          'Account deletion request error:',
          e
        );

        return res.status(500).json({
          error:
            'Unable to process the deletion request.'
        });
      }
    }
  );

  // POST, not GET: this permanently deletes the account, and a bare GET
  // link is routinely auto-followed by email security scanners (Microsoft
  // Safe Links, Proofpoint, etc.) before the user ever opens the email —
  // which would destroy the account with no real user action at all.
  router.post(
    '/delete-account',
    async (req, res) => {
      try {
        const decoded = jwt.verify(
          String(req.body.token || ''),
          process.env.JWT_SECRET,
          { algorithms: ["HS256"] }
        );

        if (
          decoded.purpose !==
          'account_deletion'
        ) {
          throw new Error('Invalid token');
        }

        const user =
          await prisma.user.findUnique({
            where: { id: decoded.id }
          });

        if (!user || !user.is_active) {
          return res.status(200).json({
            message:
              'Your Amora account has already been deleted or is no longer active.'
          });
        }

        await anonymizeDeletedAccount(
          user.id
        );

        res.status(200).json({
          message:
            'Your Amora account deletion request has been completed.'
        });
      } catch (e) {
        res.status(400).json({
          error:
            'This account deletion link is invalid or expired.'
        });
      }
    }
  );

  router.post('/login', async (req, res) => {
    const identifier = String(
      req.body.identifier || ''
    ).trim();

    const password = String(
      req.body.password || ''
    );

    // Per-account lockout, independent of the shared per-IP rate limiter
    // above this route: without this, an attacker spreading login attempts
    // across many IPs (or a botnet) faces no throttling at all on a
    // specific victim account. Keyed by the same hashed identifier already
    // written to login_failed events, over a 15-minute window.
    const identifierHash = crypto
      .createHash('sha256')
      .update(identifier.toLowerCase())
      .digest('hex')
      .slice(0, 24);

    const recentFailures =
      await prisma.auditLog.count({
        where: {
          action: 'login_failed',
          target_type: 'auth',
          target_id: identifierHash,
          timestamp: {
            gte: new Date(Date.now() - 15 * 60 * 1000)
          }
        }
      });

    if (recentFailures >= 10) {
      return res.status(429).json({
        error:
          'Too many failed sign-in attempts for this account. Please try again in 15 minutes.'
      });
    }

    const user =
      await prisma.user.findFirst({
        where: {
          OR: [
            {
              email:
                identifier.toLowerCase()
            },
            {
              username: identifier
            }
          ]
        }
      });

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password_hash
      ))
    ) {
      await logSecurityEvent(prisma, {
        action: 'login_failed',
        targetType: 'auth',
        targetId: identifierHash,
        details: {
          reason: 'invalid_credentials',
          requestId: req.requestId
        },
        ip: req.clientIp
      });

      return res.status(401).json({
        error: 'Invalid credentials.'
      });
    }

    if (!user.is_active) {
      await logSecurityEvent(prisma, {
        userId: user.id,
        action: 'login_blocked',
        targetType: 'user',
        targetId: user.id,
        details: {
          reason: 'account_suspended',
          requestId: req.requestId
        },
        ip: req.clientIp
      });

      return res.status(403).json({
        error: 'Account suspended.'
      });
    }

    const session =
      await createSession(user, req);

    await logSecurityEvent(prisma, {
      userId: user.id,
      action: 'login_success',
      targetType: 'user',
      targetId: user.id,
      details: {
        requestId: req.requestId,
        device:
          req.headers['user-agent']
            ?.slice(0, 180) || null
      },
      ip: req.clientIp
    });

    res.json(session);
  });

  // ---------- Change password ----------

  router.post(
    '/change-password',
    auth,
    async (req, res) => {
      const currentPassword = String(
        req.body.currentPassword || ''
      );

      const newPassword = String(
        req.body.newPassword || ''
      );

      if (newPassword.length < 10) {
        return res.status(400).json({
          error:
            'New password must be at least 10 characters.'
        });
      }

      if (
        newPassword === currentPassword
      ) {
        return res.status(400).json({
          error:
            'Choose a different password.'
        });
      }

      try {
        const user =
          await prisma.user.findUnique({
            where: {
              id: req.user.id
            }
          });

        if (!user) {
          return res.status(404).json({
            error: 'Account not found.'
          });
        }

        const valid =
          await bcrypt.compare(
            currentPassword,
            user.password_hash
          );

        if (!valid) {
          await logSecurityEvent(prisma, {
            userId: user.id,
            action:
              'password_change_failed',
            targetType: 'user',
            targetId: user.id,
            details: {
              reason:
                'invalid_current_password',
              requestId: req.requestId
            },
            ip: req.clientIp
          });

          return res.status(401).json({
            error:
              'Current password is incorrect.'
          });
        }

        const passwordHash =
          await bcrypt.hash(
            newPassword,
            12
          );

        await prisma.$transaction([
          prisma.user.update({
            where: {
              id: user.id
            },
            data: {
              password_hash: passwordHash
            }
          }),
          prisma.session.deleteMany({
            where: {
              user_id: user.id
            }
          })
        ]);

        await logSecurityEvent(prisma, {
          userId: user.id,
          action: 'password_changed',
          targetType: 'user',
          targetId: user.id,
          details: {
            requestId: req.requestId,
            sessionsRevoked: true
          },
          ip: req.clientIp
        });

        res.json({
          success: true,
          sessionsRevoked: true
        });
      } catch (e) {
        console.error(
          'Password change error:',
          e
        );

        res.status(500).json({
          error:
            'Unable to change password.'
        });
      }
    }
  );

  // ---------- Google OAuth ----------

  router.get('/google/start', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).send(
        'Google authentication is not configured'
      );
    }

    const platform =
      req.query.platform === 'mobile'
        ? 'mobile'
        : 'web';

    const state =
      crypto.randomBytes(32)
        .toString('hex');

    const stateToken = jwt.sign(
      {
        purpose:
          'google_oauth_state',
        state,
        platform
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '10m'
      }
    );

    setOAuthStateCookie(
      res,
      'google',
      stateToken
    );

    const params =
      new URLSearchParams({
        client_id:
          process.env.GOOGLE_CLIENT_ID,
        redirect_uri:
          googleRedirectUri(),
        response_type: 'code',
        scope:
          'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
        state: stateToken
      });

    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
  });

  router.get(
    '/google/callback',
    async (req, res) => {
      try {
        if (
          !req.query.code ||
          !process.env.GOOGLE_CLIENT_ID ||
          !process.env.GOOGLE_CLIENT_SECRET
        ) {
          throw new Error(
            'Google authentication is not configured'
          );
        }

        const stateToken =
          String(
            req.query.state || ''
          );

        const state =
          consumeOAuthState(
            'google',
            req,
            stateToken
          );

        res.setHeader(
          'Set-Cookie',
          'amora_google_state=; Max-Age=0; Path=/auth/google; Secure; HttpOnly; SameSite=Lax'
        );

        const isMobile =
          state.platform === 'mobile';

        const tokenRes = await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              code: String(
                req.query.code
              ),
              client_id:
                process.env.GOOGLE_CLIENT_ID,
              client_secret:
                process.env.GOOGLE_CLIENT_SECRET,
              redirect_uri:
                googleRedirectUri(),
              grant_type:
                'authorization_code'
            })
          }
        );

        const tokens =
          await tokenRes.json();

        if (!tokenRes.ok) {
          throw new Error(
            tokens.error_description ||
              'Google token exchange failed'
          );
        }

        const profileRes =
          await fetch(
            'https://openidconnect.googleapis.com/v1/userinfo',
            {
              headers: {
                Authorization:
                  `Bearer ${tokens.access_token}`
              }
            }
          );

        const profile =
          await profileRes.json();

        if (
          !profile.email ||
          !profile.email_verified ||
          !profile.sub
        ) {
          throw new Error(
            'Google email is not verified'
          );
        }

        const prepared =
          await findOrPrepareSocialUser({
            provider: 'google',
            providerAccountId:
              String(profile.sub),
            email:
              profile.email.toLowerCase(),
            displayName:
              profile.name ||
              profile.email.split('@')[0],
            req
          });

        const handoffCode =
          await createOAuthHandoff(
            prepared
          );

        return res.redirect(
          isMobile
            ? `amora://auth-callback?provider=google&code=${encodeURIComponent(handoffCode)}`
            : `${appUrl()}/auth/social-complete?provider=google&code=${encodeURIComponent(handoffCode)}`
        );
      } catch (e) {
        console.error(
          'Google OAuth error:',
          e
        );

        res.redirect(
          `${appUrl()}/login?error=google_auth_failed`
        );
      }
    }
  );

  // Note: the legacy /google/complete (purpose: 'google_signup') endpoint
  // was removed here — nothing in this codebase issues that token purpose
  // anymore. Google/Apple/Facebook signups all go through the unified
  // /auth/social/exchange -> /auth/social/complete handoff below
  // (purpose: 'social_signup').

  // ---------- Apple Sign in (native iOS) ----------

  router.post(
    '/apple/native',
    async (req, res) => {
      try {
        if (!process.env.JWT_SECRET) {
          return res.status(503).json({
            error:
              'Apple authentication is not configured.'
          });
        }

        const identityToken =
          String(
            req.body.identityToken || ''
          );

        const nonce =
          req.body.nonce
            ? String(req.body.nonce)
            : '';

        const authorizationCode =
          req.body.authorizationCode
            ? String(
                req.body.authorizationCode
              )
            : '';

        if (!identityToken) {
          return res.status(400).json({
            error:
              'Apple identity token is required.'
          });
        }

        const claims =
          await verifyAppleIdentityToken(
            identityToken,
            nonce,
            appleNativeClientId()
          );

        const providerAccountId =
          String(claims.sub);

        const email =
          claims.email
            ? String(
                claims.email
              ).toLowerCase()
            : null;

        const displayName =
          String(
            req.body.displayName || ''
          ).trim() || null;

        let refreshTokenEncrypted =
          null;

        if (authorizationCode) {
          try {
            const tokenData =
              await exchangeAppleAuthorizationCode(
                authorizationCode,
                appleNativeClientId()
              );

            refreshTokenEncrypted =
              encryptOAuthToken(
                tokenData.refresh_token
              );
          } catch (
            exchangeError
          ) {
            console.warn(
              'Apple authorization-code exchange failed:',
              exchangeError.message
            );
          }
        }

        const prepared =
          await findOrPrepareSocialUser({
            provider: 'apple',
            providerAccountId,
            email,
            displayName,
            req
          });

        if (prepared.userId) {
          if (refreshTokenEncrypted) {
            await prisma.oAuthAccount.updateMany(
              {
                where: {
                  user_id:
                    prepared.userId,
                  provider: 'apple',
                  provider_account_id:
                    providerAccountId
                },
                data: {
                  refresh_token_encrypted:
                    refreshTokenEncrypted,
                  email
                }
              }
            );
          }

          const user =
            await prisma.user.findUnique({
              where: {
                id: prepared.userId
              }
            });

          if (!user?.is_active) {
            return res.status(403).json({
              error:
                'Account suspended.'
            });
          }

          const session =
            await createSession(
              user,
              req
            );

          await logSecurityEvent(
            prisma,
            {
              userId: user.id,
              action:
                'social_login_success',
              targetType: 'user',
              targetId: user.id,
              details: {
                provider: 'apple',
                requestId:
                  req.requestId,
                hasAuthorizationCode:
                  Boolean(
                    authorizationCode
                  )
              },
              ip: req.clientIp
            }
          );

          return res.json(
            session
          );
        }

        const handoffCode =
          await createOAuthHandoff({
            ...prepared,
            refreshTokenEncrypted
          });

        res.json({
          needsProfile: true,
          provider: 'apple',
          handoffCode
        });
      } catch (e) {
        console.error(
          'Apple native authentication error:',
          e
        );

        if (
          e.message ===
          'account_suspended'
        ) {
          return res.status(403).json({
            error:
              'Account suspended.'
          });
        }

        res.status(401).json({
          error:
            'Apple sign-in could not be verified.'
        });
      }
    }
  );

  // ---------- Apple Sign in (web + Android browser flow) ----------

  router.get(
    '/apple/start',
    (req, res) => {
      try {
        const clientId =
          appleWebClientId();

        if (
          !clientId ||
          !process.env.APPLE_TEAM_ID ||
          !process.env.APPLE_KEY_ID ||
          !process.env.APPLE_PRIVATE_KEY
        ) {
          return res.status(503).send(
            'Apple web authentication is not configured'
          );
        }

        const platform =
          req.query.platform ===
          'mobile'
            ? 'mobile'
            : 'web';

        const stateToken =
          createOAuthState(
            'apple',
            platform
          );

        setOAuthStateCookie(
          res,
          'apple',
          stateToken,
          'None'
        );

        const params =
          new URLSearchParams({
            client_id: clientId,
            redirect_uri:
              appleRedirectUri(),
            response_type:
              'code id_token',
            response_mode:
              'form_post',
            scope:
              'name email',
            state: stateToken,
            nonce:
              jwt.decode(
                stateToken
              ).nonce
          });

        res.redirect(
          `https://appleid.apple.com/auth/authorize?${params}`
        );
      } catch (e) {
        console.error(
          'Apple web start error:',
          e
        );

        res.status(503).send(
          'Apple authentication is not configured'
        );
      }
    }
  );

  router.post(
    '/apple/callback',
    async (req, res) => {
      const fallback =
        `${appUrl()}/login?error=apple_auth_failed`;

      try {
        const state =
          consumeOAuthState(
            'apple',
            req,
            req.body.state
          );

        const isMobile =
          state.platform ===
          'mobile';

        if (!req.body.code) {
          throw new Error(
            'Missing Apple authorization code'
          );
        }

        const clientId =
          appleWebClientId();

        const clientSecret =
          createAppleClientSecret(
            clientId
          );

        const tokenRes =
          await fetch(
            'https://appleid.apple.com/auth/token',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded'
              },
              body:
                new URLSearchParams({
                  client_id:
                    clientId,
                  client_secret:
                    clientSecret,
                  code: String(
                    req.body.code
                  ),
                  grant_type:
                    'authorization_code',
                  redirect_uri:
                    appleRedirectUri()
                })
            }
          );

        const tokenData =
          await tokenRes.json();

        if (
          !tokenRes.ok ||
          !tokenData.id_token
        ) {
          throw new Error(
            tokenData.error_description ||
              'Apple token exchange failed'
          );
        }

        const claims =
          await verifyAppleIdentityToken(
            tokenData.id_token,
            state.nonce,
            clientId
          );

        const providerAccountId =
          String(claims.sub);

        const email =
          claims.email
            ? String(
                claims.email
              ).toLowerCase()
            : null;

        if (!email) {
          throw new Error(
            'Apple did not return an email address'
          );
        }

        const prepared =
          await findOrPrepareSocialUser({
            provider: 'apple',
            providerAccountId,
            email,
            displayName:
              String(
                req.body.user
                  ? (() => {
                      try {
                        const u =
                          JSON.parse(
                            String(
                              req.body.user
                            )
                          );

                        return [
                          u.name?.firstName,
                          u.name?.lastName
                        ]
                          .filter(Boolean)
                          .join(' ');
                      } catch {
                        return '';
                      }
                    })()
                  : ''
              ).trim() || null,
            req
          });

        res.setHeader(
          'Set-Cookie',
          'amora_apple_state=; Max-Age=0; Path=/auth/apple; Secure; HttpOnly; SameSite=None'
        );

        const refreshTokenEncrypted =
          encryptOAuthToken(
            tokenData.refresh_token
          );

        const handoffCode =
          await createOAuthHandoff({
            ...prepared,
            refreshTokenEncrypted
          });

        return res.redirect(
          isMobile
            ? `amora://auth-callback?provider=apple&code=${encodeURIComponent(handoffCode)}`
            : `${appUrl()}/auth/social-complete?provider=apple&code=${encodeURIComponent(handoffCode)}`
        );
      } catch (e) {
        console.error(
          'Apple web callback error:',
          e
        );

        res.redirect(fallback);
      }
    }
  );

  // ---------- Facebook Login (web + mobile browser flow) ----------

  router.get(
    '/facebook/start',
    (req, res) => {
      if (!process.env.FACEBOOK_APP_ID) {
        return res.status(503).send(
          'Facebook authentication is not configured'
        );
      }

      const platform =
        req.query.platform ===
        'mobile'
          ? 'mobile'
          : 'web';

      const stateToken =
        createOAuthState(
          'facebook',
          platform
        );

      setOAuthStateCookie(
        res,
        'facebook',
        stateToken
      );

      const params =
        new URLSearchParams({
          client_id:
            process.env.FACEBOOK_APP_ID,
          redirect_uri:
            facebookRedirectUri(),
          response_type: 'code',
          scope:
            'email,public_profile',
          state: stateToken
        });

      res.redirect(
        `https://www.facebook.com/${facebookGraphVersion()}/dialog/oauth?${params}`
      );
    }
  );

  router.get(
    '/facebook/callback',
    async (req, res) => {
      const fallback =
        `${appUrl()}/login?error=facebook_auth_failed`;

      try {
        const state =
          consumeOAuthState(
            'facebook',
            req,
            req.query.state
          );

        const isMobile =
          state.platform ===
          'mobile';

        if (!req.query.code) {
          throw new Error(
            'Missing Facebook authorization code'
          );
        }

        const version =
          facebookGraphVersion();

        const tokenUrl =
          `https://graph.facebook.com/${version}/oauth/access_token`;

        const tokenParams =
          new URLSearchParams({
            client_id:
              process.env.FACEBOOK_APP_ID,
            client_secret:
              process.env.FACEBOOK_APP_SECRET ||
              '',
            redirect_uri:
              facebookRedirectUri(),
            code: String(
              req.query.code
            )
          });

        const tokenRes =
          await fetch(
            `${tokenUrl}?${tokenParams}`
          );

        const tokenData =
          await tokenRes.json();

        if (
          !tokenRes.ok ||
          !tokenData.access_token
        ) {
          throw new Error(
            tokenData.error?.message ||
              'Facebook token exchange failed'
          );
        }

        const profileUrl =
          `https://graph.facebook.com/${version}/me?fields=id,name,email`;

        const profileRes =
          await fetch(
            profileUrl,
            {
              headers: {
                Authorization:
                  `Bearer ${tokenData.access_token}`
              }
            }
          );

        const profile =
          await profileRes.json();

        /*
         * IMPORTANT:
         *
         * Facebook is allowed to return no email.
         * We therefore require the user to provide
         * an email during the Amora account completion
         * step instead of treating the OAuth callback
         * as a failure.
         */
        if (
          !profileRes.ok ||
          !profile.id
        ) {
          throw new Error(
            'Facebook did not return a usable account identifier'
          );
        }

        console.log(
          'Facebook OAuth profile:',
          {
            providerAccountId:
              String(profile.id),
            hasEmail:
              Boolean(profile.email),
            displayName:
              String(
                profile.name || ''
              ).trim() || null
          }
        );

        const prepared =
          await findOrPrepareSocialUser({
            provider: 'facebook',
            providerAccountId:
              String(profile.id),
            email:
              profile.email
                ? String(
                    profile.email
                  ).toLowerCase()
                : null,
            displayName:
              String(
                profile.name || ''
              ).trim() || null,
            req
          });

        res.setHeader(
          'Set-Cookie',
          'amora_facebook_state=; Max-Age=0; Path=/auth/facebook; Secure; HttpOnly; SameSite=Lax'
        );

        const handoffCode =
          await createOAuthHandoff(
            prepared
          );

        return res.redirect(
          isMobile
            ? `amora://auth-callback?provider=facebook&code=${encodeURIComponent(handoffCode)}`
            : `${appUrl()}/auth/social-complete?provider=facebook&code=${encodeURIComponent(handoffCode)}`
        );
      } catch (e) {
        console.error(
          'Facebook OAuth error:',
          e
        );

        res.redirect(fallback);
      }
    }
  );

  // ---------- Social handoff exchange ----------

  router.post(
    '/social/exchange',
    async (req, res) => {
      try {
        const rawCode =
          String(
            req.body.code || ''
          );

        if (!rawCode) {
          return res.status(400).json({
            error:
              'Missing social handoff code.'
          });
        }

        const codeHash =
          crypto
            .createHash('sha256')
            .update(rawCode)
            .digest('hex');

        const handoff =
          await prisma.oAuthHandoff.findUnique(
            {
              where: {
                code_hash: codeHash
              }
            }
          );

        if (
          !handoff ||
          handoff.consumed_at ||
          handoff.expires_at <
            new Date()
        ) {
          return res.status(401).json({
            error:
              'This sign-in session has expired. Please try again.'
          });
        }

        if (handoff.user_id) {
          const claimed =
            await prisma.oAuthHandoff.updateMany(
              {
                where: {
                  id: handoff.id,
                  consumed_at: null
                },
                data: {
                  consumed_at:
                    new Date()
                }
              }
            );

          if (claimed.count !== 1) {
            return res.status(401).json({
              error:
                'This sign-in session has already been used.'
            });
          }

          const user =
            await prisma.user.findUnique({
              where: {
                id: handoff.user_id
              }
            });

          if (!user?.is_active) {
            return res.status(403).json({
              error:
                'Account suspended.'
            });
          }

          if (
            handoff.provider ===
              'apple' &&
            handoff.provider_account_id &&
            handoff.refresh_token_encrypted
          ) {
            await prisma.oAuthAccount.upsert(
              {
                where: {
                  provider_provider_account_id:
                    {
                      provider: 'apple',
                      provider_account_id:
                        handoff.provider_account_id
                    }
                },
                update: {
                  refresh_token_encrypted:
                    handoff.refresh_token_encrypted,
                  email:
                    handoff.email
                },
                create: {
                  user_id: user.id,
                  provider: 'apple',
                  provider_account_id:
                    handoff.provider_account_id,
                  email:
                    handoff.email,
                  refresh_token_encrypted:
                    handoff.refresh_token_encrypted
                }
              }
            );
          }

          return res.json(
            await createSession(
              user,
              req
            )
          );
        }

        const completionToken =
          jwt.sign(
            {
              purpose:
                'social_signup',
              handoffId:
                handoff.id,
              provider:
                handoff.provider
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '10m'
            }
          );

        /*
         * Tell the frontend whether an email
         * is already available from the provider.
         *
         * Facebook can return:
         *   email = null
         *
         * In that case the frontend MUST display
         * an email input.
         */
        res.json({
          needsProfile: true,
          provider:
            handoff.provider,
          completionToken,
          needsEmail:
            !handoff.email,
          email:
            handoff.email || null,
          emailVerified:
            Boolean(handoff.email)
        });
      } catch (e) {
        console.error(
          'Social handoff exchange error:',
          e
        );

        res.status(401).json({
          error:
            'Unable to complete social sign-in.'
        });
      }
    }
  );

  // ---------- Social account completion ----------

  router.post(
    '/social/complete',
    async (req, res) => {
      try {
        const decoded =
          jwt.verify(
            String(
              req.body.completionToken ||
                ''
            ),
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
          );

        if (
          decoded.purpose !==
          'social_signup'
        ) {
          throw new Error(
            'Invalid token'
          );
        }

        const username =
          String(
            req.body.username || ''
          ).trim();

        const dateOfBirth =
          new Date(
            req.body.dateOfBirth
          );

        /*
         * EMAIL IS REQUIRED.
         *
         * If Facebook supplied an email,
         * use that email.
         *
         * If Facebook did not supply one,
         * the frontend MUST send req.body.email.
         */
        const submittedEmail =
          String(
            req.body.email || ''
          ).trim().toLowerCase();

        const handoff =
          await prisma.oAuthHandoff.findUnique(
            {
              where: {
                id: decoded.handoffId
              }
            }
          );

        if (
          !handoff ||
          handoff.consumed_at ||
          handoff.expires_at <
            new Date()
        ) {
          return res.status(401).json({
            error:
              'This registration session has expired.'
          });
        }

        /*
         * Provider email = trusted/verified email
         * from Google/Apple/Facebook.
         *
         * Missing provider email = user must enter
         * a real email address and verify it.
         */
        const email =
          handoff.email ||
          submittedEmail;

        const emailWasProvidedByUser =
          !handoff.email;

        if (!email) {
          return res.status(400).json({
            error:
              'Email address is required to create an Amora account.',
            code:
              'EMAIL_REQUIRED',
            field:
              'email'
          });
        }

        const emailValidation =
          z.string().email().safeParse(
            email
          );

        if (
          !emailValidation.success
        ) {
          return res.status(400).json({
            error:
              'Please enter a valid email address.',
            code:
              'INVALID_EMAIL',
            field:
              'email'
          });
        }

        if (
          !/^[a-zA-Z0-9_.-]{3,20}$/.test(
            username
          )
        ) {
          return res.status(400).json({
            error:
              'Invalid username'
          });
        }

        if (
          Number.isNaN(
            dateOfBirth.getTime()
          ) ||
          calculateAge(dateOfBirth) < 18
        ) {
          return res.status(403).json({
            error:
              'You must be 18 or older.'
          });
        }

        /*
         * Check the email before creating the
         * account so the frontend receives a
         * clean conflict instead of a generic
         * database error.
         */
        const existingEmail =
          await prisma.user.findUnique({
            where: {
              email
            }
          });

        if (existingEmail) {
          return res.status(409).json({
            error:
              'This email address is already registered. Please sign in or use another email.',
            code:
              'EMAIL_ALREADY_REGISTERED',
            field:
              'email'
          });
        }

        const existingUsername =
          await prisma.user.findUnique({
            where: {
              username
            }
          });

        if (existingUsername) {
          return res.status(409).json({
            error:
              'This username is already taken.',
            code:
              'USERNAME_ALREADY_TAKEN',
            field:
              'username'
          });
        }

        /*
         * Social accounts don't need a password.
         * A random password is generated only because
         * the existing User schema requires password_hash.
         */
        const passwordHash =
          await bcrypt.hash(
            crypto
              .randomBytes(32)
              .toString('hex'),
            12
          );

        const user =
          await prisma.$transaction(
            async tx => {
              /*
               * Claim the handoff atomically.
               * This prevents the same OAuth handoff
               * from being used twice.
               */
              const claimed =
                await tx.oAuthHandoff.updateMany(
                  {
                    where: {
                      id: handoff.id,
                      consumed_at: null
                    },
                    data: {
                      consumed_at:
                        new Date()
                    }
                  }
                );

              if (claimed.count !== 1) {
                throw new Error(
                  'Social registration session already used'
                );
              }

              const created =
                await tx.user.create({
                  data: {
                    email,
                    username,
                    password_hash:
                      passwordHash,
                    date_of_birth:
                      dateOfBirth,
                    display_name:
                      handoff.display_name ||
                      username,
                    age_verified: true,

                    /*
                     * Google/Apple/Facebook-provided
                     * email is treated as verified.
                     *
                     * An email manually supplied because
                     * Facebook did not provide one MUST
                     * be verified by Amora first.
                     */
                    is_verified:
                      !emailWasProvidedByUser
                  }
                });

              await tx.wallet.create({
                data: {
                  user_id:
                    created.id,
                  balance: 0
                }
              });

              /*
               * Keep the Facebook/Google/Apple identity
               * permanently linked to the Amora account.
               */
              await tx.oAuthAccount.create({
                data: {
                  user_id:
                    created.id,
                  provider:
                    handoff.provider,
                  provider_account_id:
                    handoff.provider_account_id,
                  email,
                  refresh_token_encrypted:
                    handoff.refresh_token_encrypted
                }
              });

              await tx.oAuthHandoff.update({
                where: {
                  id: handoff.id
                },
                data: {
                  user_id:
                    created.id
                }
              });

              return created;
            }
          );

        /*
         * Facebook did not provide an email.
         *
         * The user supplied one manually, so send
         * Amora's normal verification email.
         */
        if (emailWasProvidedByUser) {
          const verificationSent =
            await sendVerificationEmail(
              user
            ).catch(err => {
              console.error(
                'Social registration verification email failed:',
                err.message
              );

              return false;
            });

          if (!verificationSent) {
            return res.status(503).json({
              error:
                'Your account was created, but Amora could not send the verification email. Please try resending it.',
              code:
                'VERIFICATION_EMAIL_UNAVAILABLE',
              emailVerificationRequired:
                true,
              email
            });
          }

          return res.status(201).json({
            success: true,
            id: user.id,
            provider:
              handoff.provider,
            emailVerificationRequired:
              true,
            email,
            message:
              'Your Amora account was created. Please check your email and verify your email address before signing in.'
          });
        }

        /*
         * Provider supplied a verified email.
         * No additional email verification is needed.
         */
        return res.status(201).json(
          await createSession(
            user,
            req
          )
        );
      } catch (e) {
        console.error(
          'Social registration error:',
          e
        );

        if (
          isUniqueConstraintError(e)
        ) {
          return res.status(409).json({
            error:
              'Email or username already exists.'
          });
        }

        return res.status(503).json({
          error:
            'Social registration is temporarily unavailable. Please try again shortly.'
        });
      }
    }
  );

  // ---------- Refresh ----------

  router.post(
    '/refresh',
    async (req, res) => {
      const {
        refreshToken
      } = req.body;

      try {
        const decoded =
          jwt.verify(
            refreshToken,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
          );

        if (
          decoded.type !==
          'refresh'
        ) {
          throw new Error(
            'Invalid token'
          );
        }

        const session =
          await prisma.session.findUnique(
            {
              where: {
                refresh_token:
                  refreshToken
              }
            }
          );

        if (
          !session ||
          session.expires_at <
            new Date()
        ) {
          return res.status(401).json({
            error:
              'Invalid refresh token.'
          });
        }

        const user =
          await prisma.user.findUnique({
            where: {
              id: session.user_id
            }
          });

        if (!user?.is_active) {
          return res.status(403).json({
            error:
              'Account suspended.'
          });
        }

        const nextRefreshToken =
          signRefreshToken(user);

        const updated =
          await prisma.session.updateMany(
            {
              where: {
                id: session.id,
                refresh_token:
                  refreshToken
              },
              data: {
                refresh_token:
                  nextRefreshToken,
                expires_at:
                  new Date(
                    Date.now() +
                      7 *
                        24 *
                        60 *
                        60 *
                        1000
                  )
              }
            }
          );

        if (updated.count !== 1) {
          return res.status(401).json({
            error:
              'Invalid refresh token.'
          });
        }

        res.json({
          accessToken:
            signAccessToken(user),
          refreshToken:
            nextRefreshToken,
          user: {
            id: user.id,
            username:
              user.username,
            display_name:
              user.display_name,
            level:
              user.level,
            role:
              user.role,
            membership_tier:
              user.membership_tier
          }
        });
      } catch (e) {
        console.error(
          'Refresh token error:',
          e
        );

        if (
          e?.code === 'P2002'
        ) {
          return res.status(503).json({
            error:
              'Session refresh is temporarily unavailable. Please try again.'
          });
        }

        if (
          e?.name ===
            'JsonWebTokenError' ||
          e?.name ===
            'TokenExpiredError'
        ) {
          return res.status(401).json({
            error:
              'Invalid refresh token.'
          });
        }

        return res.status(503).json({
          error:
            'Session refresh is temporarily unavailable. Please try again.'
        });
      }
    }
  );

  // ---------- Logout ----------

  router.post(
    '/logout',
    async (req, res) => {
      await prisma.session.deleteMany({
        where: {
          refresh_token:
            req.body.refreshToken || ''
        }
      });

      res.json({
        success: true
      });
    }
  );

  return router;
};
