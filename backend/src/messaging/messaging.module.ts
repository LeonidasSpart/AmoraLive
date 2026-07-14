import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.accessExpiration') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessagingController],
  providers: [ChatGateway, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
