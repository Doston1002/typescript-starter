import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database.module';
import { StudentController } from './student.controller';
import { DirektorController } from './direktor.controller';
import { AuthController } from './auth.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, StudentController, DirektorController, AuthController],
  providers: [AppService],
})
export class AppModule {}
