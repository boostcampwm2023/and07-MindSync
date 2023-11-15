import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MindmapService } from '../mindmap/mindmap.service';

interface BoardDataPayload {
  message: any;
  boardId: string;
}

@WebSocketGateway({ namespace: 'board' })
export class BoardGateway {
  constructor(private readonly mindmapService: MindmapService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { boardId: string }): void {
    client.join(payload.boardId);
  }

  @SubscribeMessage('pushData')
  handlePushNode(client: Socket, payload: BoardDataPayload): void {
    this.mindmapService.updateMindmap(payload.boardId, payload.message);
    client.broadcast
      .to(payload.boardId)
      .emit(
        'messageFromServer',
        this.mindmapService.getEncodedState(payload.boardId),
      );
  }
}
