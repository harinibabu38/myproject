import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get('info')
  getMcpInfo() {
    return {
      serverName: 'ai-saas-platform-mcp',
      version: '1.0.0',
      protocol: 'Model Context Protocol (MCP)',
      status: 'active',
      supportedTransports: ['stdio', 'http-json', 'sse'],
    };
  }

  @Get('tools')
  getTools() {
    return {
      tools: this.mcpService.getToolList(),
    };
  }

  @Post('tools/call')
  async callTool(@Body() body: { name: string; args?: Record<string, any> }) {
    if (!body || !body.name) {
      throw new BadRequestException('Property "name" is required in request body.');
    }

    try {
      const result = await this.mcpService.callToolDirect(body.name, body.args || {});
      return {
        success: true,
        tool: body.name,
        result,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
