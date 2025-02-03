import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardTreesService } from './board-trees.service';
import type { BoardOperation } from './schemas/board-operation.schema';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway implements OnGatewayConnection {
  constructor(
    private boardTreesService: BoardTreesService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, token: string) {
    if (!token) {
      client.disconnect();
      throw new UnauthorizedException();
    }
    try {
      this.jwtService.verify(token);
    } catch (error) {
      client.disconnect();
      throw new UnauthorizedException();
    }
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(client: Socket, payload: string) {
    const payloadObject = JSON.parse(payload);
    client.join(payloadObject.boardId);
    client.emit('boardJoined');
  }

  @SubscribeMessage('createOperation')
  async handleCreateOperation(client: Socket, operation: BoardOperation) {
    await this.boardTreesService.createOperationLog(operation);
    client.broadcast.to(operation.boardId).emit('operation', operation);
  }

  @SubscribeMessage('getOperations')
  async handleGetOperations(client: Socket, boardId: string) {
    const operations = await this.boardTreesService.getOperationLogs(boardId);
    client.emit('getOperations', operations);
  }
}
