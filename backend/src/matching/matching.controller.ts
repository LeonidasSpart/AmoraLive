import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Matching')
@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRecommendations(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.matchingService.getRecommendations(userId, parseInt(limit || '10'));
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async likeUser(
    @CurrentUser('sub') userId: string,
    @Body() body: { targetId: string; type?: string; message?: string },
  ) {
    return this.matchingService.likeUser(userId, body.targetId, body.type, body.message);
  }

  @Post('pass')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async passUser(
    @CurrentUser('sub') userId: string,
    @Body() body: { targetId: string },
  ) {
    return this.matchingService.passUser(userId, body.targetId);
  }

  @Get('matches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMatches(@CurrentUser('sub') userId: string) {
    return this.matchingService.getMatches(userId);
  }

  @Get('likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getLikes(@CurrentUser('sub') userId: string) {
    return this.matchingService.getLikes(userId);
  }
}
