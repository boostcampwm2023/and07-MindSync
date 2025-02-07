import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { BoardTreesService } from './board-trees.service';
import type { BoardOperation } from './schemas/board-operation.schema';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private boardTreesService: BoardTreesService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
        this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        });
        next();
      } catch (error) {
        next(new WsException('token is invalid'));
      }
    });
  }

  handleConnection(client: Socket) {
    const query = client.handshake.query;
    const boardId = query.boardId;

    if (!boardId) {
      client.emit('board_id_required', new WsException('board id required'));
      client.disconnect();
    }
    client.join(boardId);
    client.emit('board_joined', boardId);
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
