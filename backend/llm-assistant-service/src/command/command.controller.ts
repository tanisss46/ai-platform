import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandService } from './command.service';
import { CommandRequestDto } from './dto/command-request.dto';
import { CommandResponseDto } from './dto/command-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('command')
@UseGuards(JwtAuthGuard)
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  /**
   * Process a natural language command
   * @param userId The current user's ID
   * @param commandRequest The command request data
   */
  @Post()
  async processCommand(
    @CurrentUser() userId: string,
    @Body() commandRequest: CommandRequestDto,
  ): Promise<CommandResponseDto> {
    return this.commandService.processCommand(userId, commandRequest);
  }
}
