import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ChatService, ChatMessage } from './chat.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

class ChatCompletionDto {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('completion')
  async getChatCompletion(
    @Body() chatCompletionDto: ChatCompletionDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    
    // Add a system message if none exists
    if (!chatCompletionDto.messages.some(msg => msg.role === 'system')) {
      const systemPrompt = await this.chatService.generateSystemPrompt();
      chatCompletionDto.messages.unshift({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    // Log the user's message for analytics (in a real app, you'd store this)
    const userMessages = chatCompletionDto.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
      
    if (userMessages.length > 0) {
      console.log(`User ${userId} sent message: ${userMessages[userMessages.length - 1]}`);
    }
    
    const response = await this.chatService.generateChatCompletion(
      chatCompletionDto.messages,
      {
        temperature: chatCompletionDto.temperature,
        max_tokens: chatCompletionDto.max_tokens,
        model: chatCompletionDto.model
      }
    );
    
    return { response };
  }
}