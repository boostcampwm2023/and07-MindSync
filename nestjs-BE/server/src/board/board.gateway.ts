import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'board' })
export class BoardGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinBoard')
  handleJoinBoard(client: Socket, payload: string): void {
    const payloadObject = JSON.parse(payload);
    client.join(payloadObject.boardId);
  }

  @SubscribeMessage('updateMindmap')
  handleUpdateMindmap(client: Socket, payload: string) {
    const payloadObject = JSON.parse(payload);
    client.broadcast
      .to(payloadObject.boardId)
      .emit('operationFromServer', payloadObject.operation);
  }
}
