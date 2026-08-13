import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService, ChatResponseDto } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { message: string }): Promise<ChatResponseDto> {
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      throw new BadRequestException('Property "message" is required and must be a non-empty string.');
    }

    return this.aiService.processChatMessage(body.message.trim());
  }
}
