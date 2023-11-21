import { Injectable } from '@nestjs/common';
import { LWWMap, lwwMapState } from 'crdt/map';

@Injectable()
export class MindmapService {
  private boards = new Map<string, LWWMap<string>>();

  updateMindmap(boardId: string, message: any): void {
    const board = this.getMindmap(boardId);
    board.merge(message);
  }

  getEncodedState(boardId: string): lwwMapState<string> {
    const board = this.getMindmap(boardId);
    return board.getState();
  }

  private getMindmap(boardId: string) {
    let board = this.boards.get(boardId);
    if (!board) {
      board = new LWWMap<string>(boardId); // boardId 대신에 서버 아이디???
      this.boards.set(boardId, board);
    }
    return board;
  }
}
