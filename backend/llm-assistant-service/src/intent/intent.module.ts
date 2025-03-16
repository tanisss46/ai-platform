import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IntentService } from './intent.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [IntentService],
  exports: [IntentService],
})
export class IntentModule {}
