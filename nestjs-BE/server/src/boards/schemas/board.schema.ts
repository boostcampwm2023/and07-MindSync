import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;

@Schema()
export class Board {
  @Prop()
  uuid: string;

  @Prop()
  boardName: string;

  @Prop()
  spaceId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  restoredAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  imageUrl: string;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
