import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalMatches,
      totalMessages,
      pendingReports,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.account.count(),
      this.prisma.account.count({ where: { status: 'ACTIVE' } }),
      this.prisma.account.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.match.count(),
      this.prisma.message.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalMatches,
      totalMessages,
      pendingReports,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getUsers(page: number = 1, limit: number = 50, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { profile: { firstName: { contains: search, mode: 'insensitive' as const } } },
            { profile: { lastName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: {
          profile: true,
          subscription: true,
          verification: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.account.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReports(status?: string) {
    return this.prisma.report.findMany({
      where: status ? { status: status as any } : {},
      include: {
        reporter: { include: { profile: true } },
        reported: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveReport(reportId: string, resolution: string, adminId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolution,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });
  }

  async suspendUser(userId: string, reason: string, adminId: string) {
    await this.prisma.account.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });

    await this.prisma.moderationLog.create({
      data: {
        type: 'suspend',
        targetType: 'user',
        targetId: userId,
        action: 'SUSPEND',
        reason,
        performedBy: adminId,
      },
    });

    return { success: true };
  }

  async getSubscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        account: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
