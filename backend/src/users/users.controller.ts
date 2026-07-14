import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateMe(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.usersService.updateProfile(userId, body);
  }

  @Put('me/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updatePreferences(@CurrentUser('sub') userId: string, @Body() body: any) {
    return this.usersService.updatePreferences(userId, body);
  }

  @Post('me/photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async uploadPhoto(
    @CurrentUser('sub') userId: string,
    @Body() body: { url: string; isPrimary?: boolean },
  ) {
    return this.usersService.uploadPhoto(userId, body.url, body.isPrimary);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPublicProfile(
    @CurrentUser('sub') viewerId: string,
    @Param('id') userId: string,
  ) {
    return this.usersService.getPublicProfile(userId, viewerId);
  }
}
