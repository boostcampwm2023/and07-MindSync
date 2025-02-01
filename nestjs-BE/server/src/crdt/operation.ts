import { Clock } from './clock';
import { Node } from './node';
import { Tree } from './tree';

export interface OperationLog {
  operation: Operation;
  oldParentId?: string;
  oldDescription?: string | null;
}

export interface OperationInput {
  id: string;
  clock: Clock;
}

export interface OperationAddInput extends OperationInput {
  description: string;
  parentId: string;
}

export interface OperationMoveInput extends OperationInput {
  parentId: string;
}

export interface OperationUpdateInput extends OperationInput {
  description: string;
}

interface ClockInterface {
  id: string;
  counter: number;
}

export interface SerializedOperation {
  operationType: string;
  id: string;
  clock: ClockInterface;
  description?: string;
  parentId?: string;
}

export abstract class Operation {
  operationType: string;
  id: string;
  clock: Clock;

  constructor(operationType: string, id: string, clock: Clock) {
    this.operationType = operationType;
    this.id = id;
    this.clock = clock;
  }

  abstract doOperation(tree: Tree): OperationLog;
  abstract undoOperation(tree: Tree, log: OperationLog): void;
  abstract redoOperation(tree: Tree, log: OperationLog): OperationLog;
}

export class OperationAdd extends Operation {
  description: string;
  parentId: string;

  constructor(input: OperationAddInput) {
    super('add', input.id, input.clock);
    this.description = input.description;
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree): OperationLog {
    tree.addNode(this.id, this.parentId, this.description);
    return { operation: this };
  }

  undoOperation(tree: Tree, log: OperationLog): void {
    tree.removeNode(log.operation.id);
  }

  redoOperation(tree: Tree, log: OperationLog): OperationLog {
    tree.attachNode(log.operation.id, this.parentId);
    return { operation: this };
  }

  static parse(serializedOperation: SerializedOperation): OperationAdd {
    const input: OperationAddInput = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId as string,
      description: serializedOperation.description as string,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationAdd(input);
  }
}

export class OperationDelete extends Operation {
  constructor(input: OperationInput) {
    super('delete', input.id, input.clock);
  }

  doOperation(tree: Tree): OperationLog {
    const node = tree.get(this.id) as Node;
    const oldParentId = node.parentId;
    tree.removeNode(this.id);
    return { operation: this, oldParentId: oldParentId };
  }

  undoOperation(tree: Tree, log: OperationLog): void {
    tree.attachNode(log.operation.id, log.oldParentId as string);
  }

  redoOperation(tree: Tree, log: OperationLog): OperationLog {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse(serializedOperation: SerializedOperation): OperationDelete {
    const input: OperationInput = {
      id: serializedOperation.id,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationDelete(input);
  }
}

export class OperationMove extends Operation {
  parentId: string;

  constructor(input: OperationMoveInput) {
    super('move', input.id, input.clock);
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree): OperationLog {
    const node = tree.get(this.id) as Node;
    const oldParentId = node.parentId;

    if (tree.isAncestor(this.parentId, this.id)) {
      return { operation: this, oldParentId };
    }

    tree.removeNode(this.id);
    tree.attachNode(this.id, this.parentId);
    return { operation: this, oldParentId };
  }

  undoOperation(tree: Tree, log: OperationLog): void {
    tree.removeNode(log.operation.id);
    tree.attachNode(log.operation.id, log.oldParentId as string);
  }

  redoOperation(tree: Tree, log: OperationLog): OperationLog {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse(serializedOperation: SerializedOperation): OperationMove {
    const input: OperationMoveInput = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId as string,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationMove(input);
  }
}

export class OperationUpdate extends Operation {
  description: string;

  constructor(input: OperationUpdateInput) {
    super('update', input.id, input.clock);
    this.description = input.description;
  }

  doOperation(tree: Tree): OperationLog {
    const node = tree.get(this.id) as Node;
    const oldDescription = node.description;
    tree.updateNode(this.id, this.description);
    return { operation: this, oldDescription: oldDescription };
  }

  undoOperation(tree: Tree, log: OperationLog): void {
    tree.updateNode(log.operation.id, log.oldDescription as string);
  }

  redoOperation(tree: Tree, log: OperationLog): OperationLog {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse(serializedOperation: SerializedOperation): OperationUpdate {
    const input: OperationUpdateInput = {
      id: serializedOperation.id,
      description: serializedOperation.description as string,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationUpdate(input);
  }
}
