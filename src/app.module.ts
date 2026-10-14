import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TelegramBotService } from './telegram-bot.service.js';

// import { DatabaseModule } from './database.module';
// import { StudentController } from './student.controller';
// import { DirektorController } from './direktor.controller';
// import { AuthController } from './auth.controller';

@Module({
  controllers: [AppController],
  providers: [AppService, TelegramBotService],
})
export class AppModule {}
