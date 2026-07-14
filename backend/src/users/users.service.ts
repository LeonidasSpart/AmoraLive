import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.account.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        preferences: true,
        photos: true,
        verification: true,
        subscription: true,
      },
    });
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.profile.update({
      where: { accountId: userId },
      data,
    });
  }

  async updatePreferences(userId: string, data: any) {
    return this.prisma.preferences.update({
      where: { accountId: userId },
      data,
    });
  }

  async uploadPhoto(userId: string, url: string, isPrimary: boolean = false) {
    if (isPrimary) {
      await this.prisma.photo.updateMany({
        where: { accountId: userId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.photo.create({
      data: {
        accountId: userId,
        url,
        isPrimary,
      },
    });
  }

  async getPublicProfile(userId: string, viewerId: string) {
    const profile = await this.prisma.account.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: true,
        verification: true,
      },
    });

    if (!profile) return null;

    // Check if blocked
    const isBlocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: viewerId },
          { blockerId: viewerId, blockedId: userId },
        ],
      },
    });

    if (isBlocked) return null;

    // Hide sensitive info
    const { email, phone, ...publicProfile } = profile as any;

    return publicProfile;
  }
}
