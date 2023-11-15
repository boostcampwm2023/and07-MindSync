import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';

@Injectable()
export class MindmapService {
  private ydocs = new Map<string, Y.Doc>();

  updateMindmap(boardId: string, message: any) {
    const ydoc = this.getMindmap(boardId);
    Y.applyUpdate(ydoc, message);
  }

  getEncodedState(boardId: string) {
    const ydoc = this.getMindmap(boardId);
    return Y.encodeStateAsUpdate(ydoc);
  }

  private getMindmap(boardId: string) {
    let ydoc = this.ydocs.get(boardId);
    if (!ydoc) {
      ydoc = new Y.Doc();
      this.ydocs.set(boardId, ydoc);
    }
    return ydoc;
  }
}
