import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

// Product catalog: maps store product IDs to internal tier + duration.
// In production this would live in DB/admin-config, kept static here for clarity.
const PRODUCT_CATALOG: Record<string, { tier: 'PLUS' | 'PREMIUM' | 'VIP'; days: number; amount: number }> = {
  'amora.plus.monthly': { tier: 'PLUS', days: 30, amount: 9.99 },
  'amora.premium.monthly': { tier: 'PREMIUM', days: 30, amount: 19.99 },
  'amora.vip.monthly': { tier: 'VIP', days: 30, amount: 39.99 },
  'amora.premium.yearly': { tier: 'PREMIUM', days: 365, amount: 179.99 },
};

const SUPPORTED_CRYPTO = ['BTC', 'ETH', 'USDC', 'USDT'];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // ==========================================================
  // APPLE IAP
  // ==========================================================

  async validateAppleReceipt(userId: string, receiptData: string, productId: string) {
    if (!receiptData) throw new BadRequestException('Missing receipt data');

    const product = this.resolveProduct(productId);

    // NOTE: real verification calls Apple's verifyReceipt endpoint
    // (https://buy.itunes.apple.com/verifyReceipt, sandbox: https://sandbox.itunes.apple.com/verifyReceipt)
    // with { 'receipt-data': receiptData, password: sharedSecret } and checks status === 0.
    // Wired here as an injectable verifier so it's a one-line swap once App Store Connect
    // credentials exist — see verifyWithAppStore().
    const verification = await this.verifyWithAppStore(receiptData);
    if (!verification.valid) {
      throw new BadRequestException('Apple receipt verification failed');
    }

    return this.provisionEntitlement(userId, product, {
      provider: 'apple',
      providerPaymentId: verification.transactionId ?? receiptData.slice(0, 40),
    });
  }

  private async verifyWithAppStore(receiptData: string): Promise<{ valid: boolean; transactionId?: string }> {
    const sharedSecret = this.configService.get('apple.iapSharedSecret');
    if (!sharedSecret) {
      this.logger.warn('APPLE_SHARED_SECRET not configured; rejecting receipt verification');
      return { valid: false };
    }
    // Integration point: POST to Apple verifyReceipt endpoint here with fetch/axios.
    // Left unimplemented pending store credentials — throwing keeps behavior explicit
    // rather than silently trusting unverified receipts.
    throw new BadRequestException('Apple payment verification is not yet configured on this server');
  }

  // ==========================================================
  // GOOGLE PLAY
  // ==========================================================

  async validateGooglePurchase(userId: string, purchaseToken: string, productId: string) {
    if (!purchaseToken) throw new BadRequestException('Missing purchase token');
    const product = this.resolveProduct(productId);

    const verification = await this.verifyWithGooglePlay(purchaseToken, productId);
    if (!verification.valid) {
      throw new BadRequestException('Google Play purchase verification failed');
    }

    return this.provisionEntitlement(userId, product, {
      provider: 'google',
      providerPaymentId: verification.orderId ?? purchaseToken.slice(0, 40),
    });
  }

  private async verifyWithGooglePlay(
    purchaseToken: string,
    productId: string,
  ): Promise<{ valid: boolean; orderId?: string }> {
    const serviceAccount = this.configService.get('googlePlay.serviceAccountJson');
    if (!serviceAccount) {
      this.logger.warn('Google Play service account not configured; rejecting purchase verification');
      return { valid: false };
    }
    // Integration point: call the Google Play Developer API
    // purchases.subscriptions.get via googleapis client with the service account.
    throw new BadRequestException('Google Play verification is not yet configured on this server');
  }

  // ==========================================================
  // PAYPAL
  // ==========================================================

  async createPayPalOrder(userId: string, amount: number, currency = 'USD') {
    if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');

    const clientId = this.configService.get('paypal.clientId');
    const clientSecret = this.configService.get('paypal.clientSecret');
    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal is not configured on this server');
    }

    // Integration point: use @paypal/checkout-server-sdk to create an order via
    // OrdersCreateRequest, returning the approval link for client-side redirect.
    const payment = await this.prisma.payment.create({
      data: {
        accountId: userId,
        amount,
        currency,
        provider: 'paypal',
        status: 'PENDING',
        type: 'subscription',
        description: 'PayPal order created, awaiting approval',
      },
    });

    return {
      paymentId: payment.id,
      status: 'created',
      // approvalUrl would come back from PayPal's Orders API response.links
      message: 'PayPal order record created; complete integration requires live API credentials',
    };
  }

  // ==========================================================
  // CRYPTO
  // ==========================================================

  async createCryptoPayment(userId: string, amount: number, currency: string, cryptoType: string) {
    if (!amount || amount <= 0) throw new BadRequestException('Invalid amount');
    const symbol = cryptoType?.toUpperCase();
    if (!SUPPORTED_CRYPTO.includes(symbol)) {
      throw new BadRequestException(`Unsupported crypto currency: ${cryptoType}`);
    }

    const merchantWallet = this.configService.get('crypto.merchantWallet');
    if (!merchantWallet) {
      throw new BadRequestException('Crypto payments are not configured on this server');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        accountId: userId,
        type: 'SUBSCRIPTION',
        amount,
        currency,
        cryptoCurrency: symbol,
        walletAddress: merchantWallet,
        status: 'PENDING',
        description: `Awaiting on-chain payment of ${symbol}`,
      },
    });

    return {
      transactionId: transaction.id,
      payToAddress: merchantWallet,
      cryptoCurrency: symbol,
      status: 'awaiting_payment',
      // cryptoAmount would be computed here from a live FX rate (e.g. CoinGecko API)
    };
  }

  async verifyCryptoPayment(txHash: string, cryptoType: string) {
    if (!txHash) throw new BadRequestException('Missing transaction hash');

    const transaction = await this.prisma.transaction.findFirst({
      where: { cryptoCurrency: cryptoType?.toUpperCase(), status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (!transaction) {
      throw new BadRequestException('No matching pending transaction found');
    }

    // Integration point: query chain via ethers/web3 (EVM chains) or a BTC node/explorer API,
    // confirm value + destination address + confirmation count, then mark CONFIRMED.
    const network = this.configService.get('crypto.ethNetwork');
    if (!network) {
      throw new BadRequestException('Blockchain verification is not yet configured on this server');
    }

    throw new BadRequestException('On-chain verification is not yet configured on this server');
  }

  // ==========================================================
  // SHARED ENTITLEMENT PROVISIONING
  // ==========================================================

  private resolveProduct(productId: string) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) throw new BadRequestException(`Unknown product: ${productId}`);
    return product;
  }

  private async provisionEntitlement(
    userId: string,
    product: { tier: 'PLUS' | 'PREMIUM' | 'VIP'; days: number; amount: number },
    source: { provider: string; providerPaymentId: string },
  ) {
    const now = new Date();
    const periodEnd = new Date(now.getTime() + product.days * 24 * 60 * 60 * 1000);

    const [subscription, payment] = await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { accountId: userId },
        update: {
          tier: product.tier,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          canceledAt: null,
          provider: source.provider,
          providerSubscriptionId: source.providerPaymentId,
        },
        create: {
          accountId: userId,
          tier: product.tier,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          provider: source.provider,
          providerSubscriptionId: source.providerPaymentId,
        },
      }),
      this.prisma.payment.create({
        data: {
          accountId: userId,
          amount: product.amount,
          currency: 'USD',
          provider: source.provider,
          providerPaymentId: source.providerPaymentId,
          status: 'COMPLETED',
          type: 'subscription',
          description: `${product.tier} subscription (${product.days}d)`,
        },
      }),
      this.prisma.account.update({
        where: { id: userId },
        data: { role: 'PREMIUM' },
      }),
    ]);

    return { subscription, payment, tier: product.tier, expiresAt: periodEnd };
  }
}
