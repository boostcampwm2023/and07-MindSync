import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { BoardTreesService } from './board-trees.service';
import type { BoardOperation } from './schemas/board-operation.schema';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private boardTreesService: BoardTreesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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
      client.emit('boardIdRequired', new WsException('board id required'));
      client.disconnect();
    }
    client.join(boardId);
    client.emit('boardJoined', boardId);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('createOperation')
  async handleCreateOperation(
    @ConnectedSocket() client: Socket,
    @MessageBody('operation') operation: BoardOperation,
  ) {
    await this.boardTreesService.createOperationLog(operation);
    client.broadcast.to(operation.boardId).emit('operation', operation);
    return { status: true };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('getOperations')
  async handleGetOperations(
    @MessageBody('boardId') boardId: string,
  ): Promise<BoardOperation[]> {
    const operations = await this.boardTreesService.getOperationLogs(boardId);
    return operations;
  }
}
