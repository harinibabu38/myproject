import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface PlatformMetrics {
  activeSubscribers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  paidInvoicesCount: number;
  currency: string;
  calculatedAt: string;
  cached: boolean;
  ttlRemainingSeconds: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly CACHE_KEY = 'metrics:platform_summary';
  private readonly CACHE_TTL_SECONDS = 60;

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async getActiveSubscriberCount(): Promise<number> {
    return this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
  }

  async getSimulatedRevenue(): Promise<{ totalRevenue: number; paidInvoicesCount: number; currency: string }> {
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .addSelect('COUNT(invoice.id)', 'count')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();

    const totalRevenue = parseFloat(result?.total || '0');
    const paidInvoicesCount = parseInt(result?.count || '0', 10);

    return {
      totalRevenue: Number.isNaN(totalRevenue) ? 0 : totalRevenue,
      paidInvoicesCount: Number.isNaN(paidInvoicesCount) ? 0 : paidInvoicesCount,
      currency: 'usd',
    };
  }

  async getPlatformMetrics(bypassCache = false): Promise<PlatformMetrics> {
    if (!bypassCache) {
      try {
        const cachedData = await this.redisClient.get(this.CACHE_KEY);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const ttl = await this.redisClient.ttl(this.CACHE_KEY);
          this.logger.log(`Serving platform metrics from Redis cache (TTL remaining: ${ttl}s)`);
          return {
            ...parsed,
            cached: true,
            ttlRemainingSeconds: ttl > 0 ? ttl : 0,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Redis fetch failed, querying database directly: ${err.message}`);
      }
    }

    this.logger.log('Calculating fresh platform metrics from database...');
    const activeSubscribers = await this.getActiveSubscriberCount();
    const totalSubscriptions = await this.subscriptionRepository.count();
    const revenueInfo = await this.getSimulatedRevenue();

    const metricsData = {
      activeSubscribers,
      totalSubscriptions,
      totalRevenue: revenueInfo.totalRevenue,
      paidInvoicesCount: revenueInfo.paidInvoicesCount,
      currency: revenueInfo.currency,
      calculatedAt: new Date().toISOString(),
    };

    try {
      await this.redisClient.set(
        this.CACHE_KEY,
        JSON.stringify(metricsData),
        'EX',
        this.CACHE_TTL_SECONDS,
      );
      this.logger.log(`Cached platform metrics in Redis with ${this.CACHE_TTL_SECONDS}s expiration`);
    } catch (err: any) {
      this.logger.warn(`Failed to write metrics to Redis cache: ${err.message}`);
    }

    return {
      ...metricsData,
      cached: false,
      ttlRemainingSeconds: this.CACHE_TTL_SECONDS,
    };
  }

  async invalidateMetricsCache(): Promise<{ message: string; clearedKeys: string[] }> {
    try {
      await this.redisClient.del(this.CACHE_KEY);
      this.logger.log(`Invalidated Redis metrics cache key: ${this.CACHE_KEY}`);
      return {
        message: 'Metrics cache invalidated successfully',
        clearedKeys: [this.CACHE_KEY],
      };
    } catch (err: any) {
      this.logger.error(`Error invalidating metrics cache: ${err.message}`);
      return {
        message: `Failed to invalidate cache: ${err.message}`,
        clearedKeys: [],
      };
    }
  }
}
