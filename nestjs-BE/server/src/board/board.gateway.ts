import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface MindmapDataPayload {
  message: any;
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
    client.broadcast.to(payload.boardId).emit('stateFromServer', payload);
  }
}
