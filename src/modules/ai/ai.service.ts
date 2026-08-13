import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { McpService } from '../mcp/mcp.service';

export interface ChatRequestDto {
  message: string;
}

export interface ChatResponseDto {
  answer: string;
  toolsUsed: string[];
  mcpToolData?: any;
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private openAiClient: OpenAI | null = null;
  private apiKey: string = '';

  constructor(
    private readonly configService: ConfigService,
    private readonly mcpService: McpService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY || '';
    if (this.apiKey && !this.apiKey.startsWith('sk_placeholder')) {
      this.openAiClient = new OpenAI({ apiKey: this.apiKey });
    }
  }

  onModuleInit() {
    this.logger.log('AiService initialized with OpenAI SDK and MCP Server integration.');
  }

  async processChatMessage(message: string): Promise<ChatResponseDto> {
    const lower = message.toLowerCase();
    const toolsUsed: string[] = [];

    let targetTool = 'get_platform_metrics';
    if (lower.includes('subscriber') || lower.includes('user') || lower.includes('count')) {
      targetTool = 'get_active_subscribers';
    } else if (
      lower.includes('revenue') ||
      lower.includes('income') ||
      lower.includes('money') ||
      lower.includes('invoice') ||
      lower.includes('paid')
    ) {
      targetTool = 'get_simulated_revenue';
    }

    this.logger.log(`AI Agent executing MCP tool "${targetTool}" for message: "${message}"`);
    const toolResult = await this.mcpService.callToolDirect(targetTool, {});
    toolsUsed.push(targetTool);

   
    if (this.openAiClient && this.apiKey && !this.apiKey.startsWith('sk_placeholder')) {
      try {
        const response = await this.openAiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI Business Assistant for an AI SaaS platform. Summarize platform metrics clearly and professionally using the retrieved MCP tool data.',
            },
            {
              role: 'user',
              content: `User query: "${message}"\n\nRetrieved MCP Tool (${targetTool}) Data:\n${JSON.stringify(toolResult, null, 2)}`,
            },
          ],
        });

        const answer =
          response.choices[0]?.message?.content || this.generateFallbackAnswer(targetTool, toolResult);
        return {
          answer,
          toolsUsed,
          mcpToolData: toolResult,
        };
      } catch (err: any) {
        this.logger.warn(`OpenAI API call failed (${err.message}), returning formatted natural-language response.`);
      }
    }

    const answer = this.generateFallbackAnswer(targetTool, toolResult);
    return {
      answer,
      toolsUsed,
      mcpToolData: toolResult,
    };
  }

  private generateFallbackAnswer(toolUsed: string, data: any): string {
    if (toolUsed === 'get_active_subscribers') {
      return `Based on live data retrieved from our MCP Server tool, your platform currently has ${data.activeSubscribers ?? 0} active subscriber(s) out of ${data.totalSubscriptions ?? 0} total registered subscription(s). (Cache status: ${data.cached ? 'Hit' : 'Miss'}).`;
    }

    if (toolUsed === 'get_simulated_revenue') {
      return `Based on live financial metrics retrieved from our MCP Server tool, your platform has generated a total simulated revenue of $${(data.totalRevenue ?? 0).toFixed(2)} ${data.currency ? data.currency.toUpperCase() : 'USD'} across ${data.paidInvoicesCount ?? 0} paid invoice(s).`;
    }

    return `Here is the current platform performance summary retrieved live from our MCP Server tool:\n- Active Subscribers: ${data.activeSubscribers ?? 0}\n- Total Subscriptions: ${data.totalSubscriptions ?? 0}\n- Total Revenue: $${(data.totalRevenue ?? 0).toFixed(2)} ${data.currency ? data.currency.toUpperCase() : 'USD'}\n- Paid Invoices: ${data.paidInvoicesCount ?? 0}\n- Cache Status: ${data.cached ? 'Cached (Redis)' : 'Calculated from DB'}.`;
  }
}
