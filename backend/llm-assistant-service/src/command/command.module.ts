import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommandService } from './command.service';
import { CommandController } from './command.controller';
import { IntentModule } from '../intent/intent.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    IntentModule,
    WorkflowModule,
  ],
  controllers: [CommandController],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
