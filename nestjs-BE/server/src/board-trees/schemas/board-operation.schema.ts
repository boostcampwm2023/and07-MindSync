import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BoardOperationDocument = HydratedDocument<BoardOperation>;

@Schema()
export class BoardOperation {
  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  parentId: string;

  @Prop()
  oldParentId: string;

  @Prop()
  content: string;

  @Prop()
  oldContent: string;
}

export const BoardOperationSchema =
  SchemaFactory.createForClass(BoardOperation);
