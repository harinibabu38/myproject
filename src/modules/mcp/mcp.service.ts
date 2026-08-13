import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);
  private mcpServer: McpServer;

  constructor(private readonly metricsService: MetricsService) {
    this.mcpServer = new McpServer({
      name: 'ai-saas-platform-mcp',
      version: '1.0.0',
    });
  }

  onModuleInit() {
    this.registerTools();
  }

  getMcpServer(): McpServer {
    return this.mcpServer;
  }

  private registerTools() {
    this.logger.log('Registering MCP tools for AI SaaS Platform metrics...');

    
    this.mcpServer.tool(
      'get_active_subscribers',
      'Get the current count of active subscribers on the AI SaaS platform.',
      
      {
        bypassCache: z
          .boolean()
          .optional()
          .describe('Bypass Redis cache to calculate directly from database'),
      },
      
      async (args) => {
          console.log('MCP: Calling getPlatformMetrics...');

        const metrics = await this.metricsService.getPlatformMetrics(args.bypassCache || false);
         console.log('MCP: getPlatformMetrics completed:', metrics);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  activeSubscribers: metrics.activeSubscribers,
                  totalSubscriptions: metrics.totalSubscriptions,
                  cached: metrics.cached,
                  ttlRemainingSeconds: metrics.ttlRemainingSeconds,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

   
    this.mcpServer.tool(
      'get_simulated_revenue',
      'Get the total simulated revenue and paid invoice count of the AI SaaS platform.',
      {
        bypassCache: z
          .boolean()
          .optional()
          .describe('Bypass Redis cache to calculate directly from database'),
      },
      async (args) => {
        const metrics = await this.metricsService.getPlatformMetrics(args.bypassCache || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalRevenue: metrics.totalRevenue,
                  paidInvoicesCount: metrics.paidInvoicesCount,
                  currency: metrics.currency,
                  cached: metrics.cached,
                  ttlRemainingSeconds: metrics.ttlRemainingSeconds,
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    
    this.mcpServer.tool(
      'get_platform_metrics',
      'Get comprehensive platform metrics including active subscribers, total revenue, subscriptions, and cache status.',
      {
        bypassCache: z
          .boolean()
          .optional()
          .describe('Bypass Redis cache to calculate directly from database'),
      },
      async (args) => {
        const metrics = await this.metricsService.getPlatformMetrics(args.bypassCache || false);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(metrics, null, 2),
            },
          ],
        };
      },
    );

    this.logger.log(
      'MCP tools successfully registered: [get_active_subscribers, get_simulated_revenue, get_platform_metrics]',
    );
  }

  async callToolDirect(name: string, args: Record<string, any> = {}) {
    const bypassCache = !!args.bypassCache;
    switch (name) {
      case 'get_active_subscribers': {
       console.log('MCP: Calling getPlatformMetrics...');

       const metrics = await this.metricsService.getPlatformMetrics(bypassCache);

       console.log('MCP: getPlatformMetrics completed:', metrics);
        return {
          activeSubscribers: metrics.activeSubscribers,
          totalSubscriptions: metrics.totalSubscriptions,
          cached: metrics.cached,
        };
      }
      case 'get_simulated_revenue': {
        const metrics = await this.metricsService.getPlatformMetrics(bypassCache);
        return {
          totalRevenue: metrics.totalRevenue,
          paidInvoicesCount: metrics.paidInvoicesCount,
          currency: metrics.currency,
          cached: metrics.cached,
        };
      }
      case 'get_platform_metrics': {
        return this.metricsService.getPlatformMetrics(bypassCache);
      }
      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  }

  getToolList() {
    return [
      {
        name: 'get_active_subscribers',
        description: 'Get the current count of active subscribers on the AI SaaS platform.',
        parameters: { bypassCache: 'boolean (optional)' },
      },
      {
        name: 'get_simulated_revenue',
        description: 'Get the total simulated revenue and paid invoice count of the AI SaaS platform.',
        parameters: { bypassCache: 'boolean (optional)' },
      },
      {
        name: 'get_platform_metrics',
        description: 'Get comprehensive platform metrics including active subscribers, total revenue, subscriptions, and cache status.',
        parameters: { bypassCache: 'boolean (optional)' },
      },
    ];
  }
}
