import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { McpService } from './mcp.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [MetricsModule],
  controllers: [McpController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
