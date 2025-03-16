import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FolderDocument = Folder & Document;

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
export class Folder {
  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  parentId?: string;

  @Prop({ type: [String], default: [] })
  path: string[];

  @Prop()
  color?: string;

  @Prop()
  icon?: string;

  @Prop({ type: [{ userId: String, permission: String }], default: [] })
  permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[];
  
  @Prop({ default: false })
  isShared: boolean;
  
  @Prop({ default: false })
  isStarred: boolean;
  
  @Prop({ default: 0 })
  childCount: number;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);