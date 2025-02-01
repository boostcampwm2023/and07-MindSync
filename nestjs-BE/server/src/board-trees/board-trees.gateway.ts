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
import {
  OperationAdd,
  OperationDelete,
  OperationMove,
  OperationUpdate,
} from '../crdt/operation';
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
    if (!this.boardTreesService.hasTree(payloadObject.boardId)) {
      await this.boardTreesService.initBoardTree(
        payloadObject.boardId,
        payloadObject.boardName,
      );
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
    const { boardId, operation: serializedOperation } = payloadObject;

    const operationTypeMap = {
      add: OperationAdd.parse,
      delete: OperationDelete.parse,
      move: OperationMove.parse,
      update: OperationUpdate.parse,
    };

    const operation =
      operationTypeMap[serializedOperation.operationType](serializedOperation);
    this.boardTreesService.applyOperation(boardId, operation);
    this.boardTreesService.updateTreeData(boardId);

    client.broadcast
      .to(boardId)
      .emit('operationFromServer', serializedOperation);
  }

  @SubscribeMessage('createOperation')
  handleCreateOperation(client: Socket, operation: BoardOperation) {
    client.broadcast.to(operation.boardId).emit('operation', operation);
  }
}
