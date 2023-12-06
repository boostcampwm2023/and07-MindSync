import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoardTreeDocument = HydratedDocument<BoardTree>;

@Schema()
export class BoardTree {
  @Prop()
  boardId: string;

  @Prop()
  tree: string;
}

export const BoardTreeSchema = SchemaFactory.createForClass(BoardTree);
