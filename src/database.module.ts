import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './student.schema';
import { Direktor, DirektorSchema } from './direktor.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/uyda-talim'),
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Direktor.name, schema: DirektorSchema },
    ]),
  ],
  exports: [
    MongooseModule,
  ],
})
export class DatabaseModule {}
