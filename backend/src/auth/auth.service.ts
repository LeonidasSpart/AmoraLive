import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../common/email.service';
import { SmsService } from '../common/sms.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
    private redisService: RedisService,
  ) {}

  async register(dto: any) {
    const existingUser = await this.prisma.account.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
            gender: dto.gender,
          },
        },
        preferences: { create: {} },
        verification: { create: {} },
      },
      include: { profile: true },
    });

    const verificationCode = this.generateVerificationCode();
    await this.redisService.set(`email_verification:${account.id}`, verificationCode, 3600);

    // Email delivery is best-effort: a misconfigured or unreachable SMTP server
    // must never fail account creation, since the account (and its data) is
    // already committed by this point. Errors are swallowed here rather than
    // propagated, so registration always succeeds once the account exists.
    Promise.all([
      this.emailService.sendVerificationEmail(account.email, verificationCode),
      this.emailService.sendWelcomeEmail(account.email, dto.firstName),
    ]).catch((err) => {
      console.error(`Registration email delivery failed for ${account.email}:`, err.message);
    });

    const tokens = await this.generateTokens(account.id);

    return {
      user: this.sanitizeUser(account),
      tokens,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(dto: any) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!account || !account.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.status === 'SUSPENDED' || account.status === 'BANNED') {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, account.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(account.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.lockedUntil && account.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked');
    }

    if (account.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: account.id, type: '2fa_pending' },
        { expiresIn: '5m' },
      );
      return {
        requires2FA: true,
        tempToken,
        message: 'Two-factor authentication required',
      };
    }

    await this.updateLastLogin(account.id);
    const tokens = await this.generateTokens(account.id);

    return { user: this.sanitizeUser(account), tokens };
  }

  async socialLogin(dto: any) {
    const { provider, providerId, email, firstName, lastName } = dto;

    let account = await this.prisma.account.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          provider === 'google' ? { googleId: providerId } : undefined,
          provider === 'apple' ? { appleId: providerId } : undefined,
          provider === 'facebook' ? { facebookId: providerId } : undefined,
        ].filter(Boolean),
      },
      include: { profile: true },
    });

    if (!account && email) {
      account = await this.prisma.account.create({
        data: {
          email,
          emailVerified: true,
          ...(provider === 'google' && { googleId: providerId }),
          ...(provider === 'apple' && { appleId: providerId }),
          ...(provider === 'facebook' && { facebookId: providerId }),
          profile: {
            create: {
              firstName: firstName || '',
              lastName: lastName || '',
            },
          },
          preferences: { create: {} },
          verification: { create: {} },
        },
        include: { profile: true },
      });
    }

    if (!account) {
      throw new BadRequestException('Unable to create account from social login');
    }

    await this.updateLastLogin(account.id);
    const tokens = await this.generateTokens(account.id);

    return { user: this.sanitizeUser(account), tokens };
  }

  async refreshToken(dto: any) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { account: { include: { profile: true } } },
    });

    if (!refreshToken || refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(refreshToken.accountId);

    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { user: this.sanitizeUser(refreshToken.account), tokens };
  }

  async logout(userId: string, token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { accountId: userId, token },
      data: { isRevoked: true, revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { accountId: userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
    return { message: 'Logged out from all devices' };
  }

  async forgotPassword(dto: any) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const resetCode = this.generateVerificationCode();
    await this.redisService.set(`password_reset:${account.id}`, resetCode, 3600);

    // Same reasoning as registration: don't let a broken SMTP config turn into
    // a 500 for the user. The reset code is already stored in Redis regardless.
    this.emailService.sendPasswordResetEmail(account.email, resetCode).catch((err) => {
      console.error(`Password reset email failed for ${account.email}:`, err.message);
    });

    return { message: 'If an account exists, a reset link has been sent' };
  }

  async resetPassword(dto: any) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) throw new NotFoundException('Account not found');

    const storedCode = await this.redisService.get(`password_reset:${account.id}`);
    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.account.update({
      where: { id: account.id },
      data: { passwordHash, passwordChangedAt: new Date() },
    });

    await this.prisma.refreshToken.updateMany({
      where: { accountId: account.id },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    await this.redisService.del(`password_reset:${account.id}`);
    return { message: 'Password reset successful' };
  }

  async verifyEmail(dto: any) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (!account) throw new NotFoundException('Account not found');

    const storedCode = await this.redisService.get(`email_verification:${account.id}`);
    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });

    await this.redisService.del(`email_verification:${account.id}`);
    return { message: 'Email verified successfully' };
  }

  async verifyPhone(dto: any) {
    const account = await this.prisma.account.findFirst({
      where: { phone: dto.phone },
    });

    if (!account) throw new NotFoundException('Account not found');

    const storedCode = await this.redisService.get(`phone_verification:${account.id}`);
    if (!storedCode || storedCode !== dto.code) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { phoneVerified: true, phoneVerifiedAt: new Date() },
    });

    await this.redisService.del(`phone_verification:${account.id}`);
    return { message: 'Phone verified successfully' };
  }

  async sendPhoneVerification(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: userId },
    });

    if (!account?.phone) {
      throw new BadRequestException('No phone number associated with account');
    }

    const code = this.generateVerificationCode();
    await this.redisService.set(`phone_verification:${userId}`, code, 600);

    // SMS delivery is also best-effort for the same reason as email above.
    this.smsService.sendVerificationSMS(account.phone, code).catch((err) => {
      console.error(`SMS verification send failed for user ${userId}:`, err.message);
    });

    return { message: 'Verification code sent' };
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, type: 'access' },
        { secret: this.configService.get('jwt.secret'), expiresIn: this.configService.get('jwt.accessExpiration') },
      ),
      this.jwtService.signAsync(
        { sub: userId, type: 'refresh' },
        { secret: this.configService.get('jwt.secret'), expiresIn: this.configService.get('jwt.refreshExpiration') },
      ),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        accountId: userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private async updateLastLogin(userId: string) {
    await this.prisma.account.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    });
  }

  private async handleFailedLogin(userId: string) {
    const account = await this.prisma.account.update({
      where: { id: userId },
      data: { loginAttempts: { increment: 1 } },
    });

    if (account.loginAttempts >= 5) {
      await this.prisma.account.update({
        where: { id: userId },
        data: { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) },
      });
    }
  }

  private sanitizeUser(account: any) {
    const { passwordHash, twoFactorSecret, ...safeUser } = account;
    return safeUser;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
