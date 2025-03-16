import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { JobStatus } from '../../models/interfaces/model-adapter.interface';

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  modelId: string;

  @Prop({ enum: JobStatus, default: JobStatus.QUEUED })
  status: JobStatus;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ type: Object, required: true })
  parameters: Record<string, any>;

  @Prop({ type: [String], default: [] })
  inputContentIds: string[];

  @Prop({ type: [String], default: [] })
  outputContentIds: string[];

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  error?: string;

  @Prop({ default: 0 })
  creditsUsed: number;

  @Prop()
  externalJobId?: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
