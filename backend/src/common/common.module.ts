import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Module({
  providers: [PrismaService, RedisService, EmailService, SmsService],
  exports: [PrismaService, RedisService, EmailService, SmsService],
})
export class CommonModule {}
