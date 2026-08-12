import { Controller, Get, Post, Delete, Query } from '@nestjs/common';
import { MetricsService, PlatformMetrics } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Query('bypassCache') bypassCache?: string): Promise<PlatformMetrics> {
    const isBypass = bypassCache === 'true' || bypassCache === '1';
    return this.metricsService.getPlatformMetrics(isBypass);
  }

  @Get('active-subscribers')
  async getActiveSubscribers(): Promise<{ activeSubscribers: number }> {
    const count = await this.metricsService.getActiveSubscriberCount();
    return { activeSubscribers: count };
  }

  @Get('revenue')
  async getRevenue(): Promise<{ totalRevenue: number; paidInvoicesCount: number; currency: string }> {
    return this.metricsService.getSimulatedRevenue();
  }

  @Delete('cache')
  async invalidateCache(): Promise<{ message: string; clearedKeys: string[] }> {
    return this.metricsService.invalidateMetricsCache();
  }

  @Post('cache/flush')
  async flushCache(): Promise<{ message: string; clearedKeys: string[] }> {
    return this.metricsService.invalidateMetricsCache();
  }
}
