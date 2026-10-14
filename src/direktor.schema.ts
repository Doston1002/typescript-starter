import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DirektorDocument = Direktor & Document;

@Schema()
export class Direktor {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'direktor'], default: 'direktor' })
  role: 'admin' | 'direktor';

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  schoolName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  districtOrCity: string;

  @Prop({ required: true })
  createdAt: string;
}

export const DirektorSchema = SchemaFactory.createForClass(Direktor);
