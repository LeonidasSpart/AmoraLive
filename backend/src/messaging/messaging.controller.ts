import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getConversations(@CurrentUser('sub') userId: string) {
    return this.messagingService.getConversations(userId);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMessages(
    @CurrentUser('sub') userId: string,
    @Param('id') conversationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagingService.getMessages(
      conversationId,
      userId,
      parseInt(page || '1'),
      parseInt(limit || '50'),
    );
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createConversation(
    @CurrentUser('sub') userId: string,
    @Body() body: { matchId: string },
  ) {
    return this.messagingService.createConversation(userId, body.matchId);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') conversationId: string,
    @Body() body: { content: string; type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LOCATION'; replyToId?: string },
  ) {
    // REST fallback for clients not connected to the websocket gateway;
    // the gateway itself calls messagingService.sendMessage directly for live delivery.
    const { message } = await this.messagingService.sendMessage(
      conversationId,
      userId,
      body.content,
      body.type,
      body.replyToId,
    );
    return message;
  }

  @Post('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id') conversationId: string,
    @Body() body: { lastReadMessageId: string },
  ) {
    return this.messagingService.markAsRead(conversationId, userId, body.lastReadMessageId);
  }
}
