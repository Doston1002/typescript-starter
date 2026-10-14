import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TelegramBotService } from './telegram-bot.service.js';

@Module({
  controllers: [AppController],
  providers: [AppService, TelegramBotService],
})
export class AppModule {}
