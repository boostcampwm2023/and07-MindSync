import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SerializedOperation } from 'crdt/operation';
import { Server, Socket } from 'socket.io';

interface MindmapDataPayload {
  operation: SerializedOperation<string>;
  boardId: string;
}

@WebSocketGateway({ namespace: 'board' })
export class BoardGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinBoard')
  handleJoinBoard(client: Socket, payload: { boardId: string }): void {
    client.join(payload.boardId);
  }

  @SubscribeMessage('updateMindmap')
  handleUpdateMindmap(client: Socket, payload: MindmapDataPayload) {
    client.broadcast
      .to(payload.boardId)
      .emit('operationFromServer', payload.operation);
  }
}
