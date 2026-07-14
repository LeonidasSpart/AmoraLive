import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      parseInt(page || '1'),
      parseInt(limit || '50'),
      search,
    );
  }

  @Get('reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReports(@Query('status') status?: string) {
    return this.adminService.getReports(status);
  }

  @Post('reports/:id/resolve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async resolveReport(
    @CurrentUser('sub') adminId: string,
    @Param('id') reportId: string,
    @Body() body: { resolution: string },
  ) {
    return this.adminService.resolveReport(reportId, body.resolution, adminId);
  }

  @Post('users/:id/suspend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async suspendUser(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.suspendUser(userId, body.reason, adminId);
  }

  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getSubscriptions() {
    return this.adminService.getSubscriptions();
  }
}
