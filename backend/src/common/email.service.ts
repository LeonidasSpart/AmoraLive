import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: false,
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.pass'),
      },
    });
  }

  async sendVerificationEmail(to: string, code: string) {
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject: 'Verify Your Amora Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899, #db2777); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">Amora</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Meaningful Connections</p>
          </div>
          <div style="padding: 40px; background: #fff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Thank you for joining Amora. Use the verification code below to complete your registration:
            </p>
            <div style="background: #fdf2f8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #db2777; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 1 hour.</p>
          </div>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject: 'Welcome to Amora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899, #db2777); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Amora, ${firstName}!</h1>
          </div>
          <div style="padding: 40px; background: #fff;">
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Your journey to meaningful connections starts now. Complete your profile to get the best matches.
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, code: string) {
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject: 'Reset Your Amora Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ec4899, #db2777); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 40px; background: #fff;">
            <p style="color: #6b7280; font-size: 16px;">Use this code to reset your password:</p>
            <div style="background: #fdf2f8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #db2777; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 1 hour.</p>
          </div>
        </div>
      `,
    });
  }
}
