import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private configService: ConfigService) {}

  async sendVerificationSMS(phone: string, code: string) {
    // In production, integrate with Twilio
    console.log(`SMS to ${phone}: Your Amora verification code is ${code}`);
    return { success: true };
  }
}
