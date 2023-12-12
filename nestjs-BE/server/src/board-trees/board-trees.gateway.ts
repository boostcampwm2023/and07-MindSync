import {
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
} from 'src/crdt/operation';

@WebSocketGateway({ namespace: 'board' })
export class BoardTreesGateway {
  constructor(private boardTreesService: BoardTreesService) {}

  @WebSocketServer()
  server: Server;

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
      add: OperationAdd.parse<string>,
      delete: OperationDelete.parse<string>,
      move: OperationMove.parse<string>,
      update: OperationUpdate.parse<string>,
    };

    const operation =
      operationTypeMap[serializedOperation.operationType](serializedOperation);
    this.boardTreesService.applyOperation(boardId, operation);
    this.boardTreesService.updateTreeData(boardId);

    client.broadcast
      .to(boardId)
      .emit('operationFromServer', serializedOperation);
  }
}
