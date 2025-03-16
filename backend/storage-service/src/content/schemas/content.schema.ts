import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Content {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['file', 'folder'] })
  type: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: null, type: MongooseSchema.Types.Mixed })
  parentId: string | null;

  @Prop({ default: [] })
  path: string[];

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ default: [] })
  sharedWith: string[];

  @Prop({ default: {} })
  permissions: Record<string, string>;

  @Prop({ default: null })
  mimeType: string;

  @Prop({ default: null })
  size: number;

  @Prop({ default: null })
  storageKey: string;

  @Prop({ default: null })
  url: string;

  @Prop({ default: null })
  thumbnailUrl: string;

  @Prop({ default: {} })
  metadata: Record<string, any>;

  // AI generation metadata fields
  @Prop({ default: null })
  generatedBy: string;

  @Prop({ default: null })
  modelId: string;

  @Prop({ default: {} })
  modelParameters: Record<string, any>;

  @Prop({ default: null })
  originalContentId: string;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  // File version tracking
  @Prop({ default: 1 })
  version: number;

  @Prop({ default: [] })
  versionHistory: {
    version: number;
    storageKey: string;
    createdAt: Date;
    size: number;
  }[];

  // Specific fields for type-specific properties
  @Prop({ default: null })
  dimensions: {
    width: number;
    height: number;
  };

  @Prop({ default: null })
  duration: number;

  @Prop({ default: {} })
  exif: Record<string, any>;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// Indexes for optimized queries
ContentSchema.index({ userId: 1, parentId: 1 });
ContentSchema.index({ userId: 1, isDeleted: 1 });
ContentSchema.index({ userId: 1, type: 1 });
ContentSchema.index({ userId: 1, isFavorite: 1 });
ContentSchema.index({ userId: 1, tags: 1 });
ContentSchema.index({ storageKey: 1 });
ContentSchema.index({ 'path': 1 });
