import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardTreesService } from './board-trees.service';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway {
  constructor(private boardTreesService: BoardTreesService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(client: Socket, payload: string) {
    const payloadObject = JSON.parse(payload);
    if (!this.boardTreesService.hasTree(payloadObject.boardId)) {
      await this.boardTreesService.initBoardTree(payloadObject.boardId);
    }
    client.join(payloadObject.boardId);
    client.emit(
      'initTree',
      this.boardTreesService.getTreeData(payloadObject.boardId),
    );
  }

  @SubscribeMessage('updateMindmap')
  handleUpdateMindmap(client: Socket, payload: string) {
    const payloadObject = JSON.parse(payload);
    client.broadcast
      .to(payloadObject.boardId)
      .emit('operationFromServer', JSON.stringify(payloadObject.operation));
  }
}
