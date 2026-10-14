import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema()
export class Student {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  birthDate: string;

  @Prop({ required: true })
  class: string;

  @Prop({ required: true })
  schoolName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  academicYear: string;

  @Prop()
  notes: string;

  @Prop()
  accommodations: string;

  @Prop({ required: true })
  educationType: 'inklyuziv' | 'uyda';

  @Prop()
  region?: string;

  @Prop()
  districtOrCity?: string;

  @Prop()
  teacherName?: string;

  @Prop()
  teacherPhone?: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  createdByRole: 'admin' | 'direktor';

  @Prop({ required: true })
  createdAt: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
