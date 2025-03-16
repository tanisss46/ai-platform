import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Content {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['image', 'video', 'audio', '3d', 'document', 'other'] })
  type: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Object })
  dimensions?: { width: number; height: number };

  @Prop()
  duration?: number;

  @Prop({ required: true })
  storageKey: string;

  @Prop()
  thumbnailKey?: string;

  @Prop()
  parentFolderId?: string;

  @Prop({ type: [String], default: [] })
  path: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Object })
  generationParams?: Record<string, any>;

  @Prop()
  modelId?: string;

  @Prop({ type: [{ version: String, storageKey: String, createdAt: Date }], default: [] })
  versions: { version: string; storageKey: string; createdAt: Date }[];

  @Prop({ type: [{ userId: String, permission: String }], default: [] })
  permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop()
  url?: string;
}

export const ContentSchema = SchemaFactory.createForClass(Content);