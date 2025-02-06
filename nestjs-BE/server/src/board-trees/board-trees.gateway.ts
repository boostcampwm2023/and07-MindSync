import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BoardTreesService } from './board-trees.service';
import type { BoardOperation } from './schemas/board-operation.schema';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway implements OnGatewayInit {
  constructor(
    private boardTreesService: BoardTreesService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        next(new WsException('access token required'));
      }
      try {
        this.jwtService.verify(token);
        next();
      } catch (error) {
        next(new WsException('token is invalid'));
      }
    });
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
