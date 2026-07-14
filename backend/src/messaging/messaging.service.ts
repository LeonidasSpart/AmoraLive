import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                profile: true,
                photos: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                profile: { select: { firstName: true } },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new Error('Not authorized');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return messages.reverse();
  }

  async assertParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId, leftAt: null },
    });
    if (!participant) {
      throw new Error('Not authorized for this conversation');
    }
    return participant;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LOCATION' = 'TEXT',
    replyToId?: string,
  ) {
    await this.assertParticipant(conversationId, senderId);

    if (!content || !content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderId,
          type,
          content: content.trim(),
          replyToId,
        },
        include: {
          sender: { select: { id: true, profile: { select: { firstName: true } } } },
          attachments: true,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: created.id,
          lastMessageAt: created.createdAt,
          messageCount: { increment: 1 },
        },
      });

      // Bump the parent Match's lastMessageAt so match lists sort correctly
      const conversation = await tx.conversation.findUnique({ where: { id: conversationId } });
      if (conversation?.matchId) {
        await tx.match.update({
          where: { id: conversation.matchId },
          data: { lastMessageAt: created.createdAt },
        });
      }

      return created;
    });

    // Recipient ids, for the gateway to push a socket event to
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, leftAt: null, userId: { not: senderId } },
      select: { userId: true },
    });

    return { message, recipientIds: participants.map((p) => p.userId) };
  }

  async markAsRead(conversationId: string, userId: string, lastReadMessageId: string) {
    await this.assertParticipant(conversationId, userId);
    return this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadMessageId, lastReadAt: new Date() },
    });
  }

  async createConversation(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new Error('Invalid match');
    }

    const existingConversation = await this.prisma.conversation.findFirst({
      where: { matchId },
    });

    if (existingConversation) {
      return existingConversation;
    }

    return this.prisma.conversation.create({
      data: {
        matchId,
        participants: {
          create: [
            { userId: match.user1Id },
            { userId: match.user2Id },
          ],
        },
      },
    });
  }
}
