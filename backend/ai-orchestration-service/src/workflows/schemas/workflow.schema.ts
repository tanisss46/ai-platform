import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobStatus } from '../../models/interfaces/model-adapter.interface';

@Schema()
export class WorkflowStep {
  @Prop({ required: true })
  modelId: string;

  @Prop({ type: Object, required: true })
  parameters: Record<string, any>;

  @Prop({ type: [String], default: [] })
  inputContentIds: string[];

  @Prop({ type: [String], default: [] })
  outputContentIds: string[];

  @Prop({ enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  error?: string;

  @Prop()
  jobId?: string;

  @Prop({ default: 0 })
  progress: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;
}

export const WorkflowStepSchema = SchemaFactory.createForClass(WorkflowStep);

@Schema({ timestamps: true })
export class Workflow extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [WorkflowStepSchema], default: [] })
  steps: WorkflowStep[];

  @Prop({ enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop({ default: 0 })
  progress: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  error?: string;

  @Prop({ default: false })
  isTemplate: boolean;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
