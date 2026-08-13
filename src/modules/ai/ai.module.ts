import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '../mcp/mcp.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [ConfigModule, McpModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
