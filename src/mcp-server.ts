import { NestFactory } from '@nestjs/core';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { AppModule } from './app.module';
import { McpService } from './modules/mcp/mcp.service';

async function bootstrap() {
  // Silence NestJS stdout logs so stdio channel is dedicated solely to JSON-RPC protocol messages
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const mcpService = app.get(McpService);
  const mcpServer = mcpService.getMcpServer();

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  process.stderr.write('AI SaaS Platform MCP Server running on stdio...\n');
}

bootstrap().catch((err) => {
  process.stderr.write(`MCP Server Error: ${err.stack || err.message}\n`);
  process.exit(1);
});
