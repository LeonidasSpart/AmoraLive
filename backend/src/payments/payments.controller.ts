import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('apple/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async validateAppleReceipt(
    @CurrentUser('sub') userId: string,
    @Body() body: { receiptData: string; productId: string },
  ) {
    return this.paymentsService.validateAppleReceipt(userId, body.receiptData, body.productId);
  }

  @Post('google/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async validateGooglePurchase(
    @CurrentUser('sub') userId: string,
    @Body() body: { purchaseToken: string; productId: string },
  ) {
    return this.paymentsService.validateGooglePurchase(userId, body.purchaseToken, body.productId);
  }

  @Post('paypal/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createPayPalOrder(
    @CurrentUser('sub') userId: string,
    @Body() body: { amount: number; currency?: string },
  ) {
    return this.paymentsService.createPayPalOrder(userId, body.amount, body.currency);
  }

  @Post('crypto/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createCryptoPayment(
    @CurrentUser('sub') userId: string,
    @Body() body: { amount: number; currency: string; cryptoType: string },
  ) {
    return this.paymentsService.createCryptoPayment(userId, body.amount, body.currency, body.cryptoType);
  }

  @Post('crypto/verify')
  async verifyCryptoPayment(@Body() body: { txHash: string; cryptoType: string }) {
    return this.paymentsService.verifyCryptoPayment(body.txHash, body.cryptoType);
  }
}
