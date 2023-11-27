import { Clock } from './clock';
import { Tree } from './tree';

export interface OperationLog<T> {
  operation: Operation<T>;
  oldParentId?: string;
  oldContent?: T;
}

export interface OperationInput<T> {
  id: string;
  clock: Clock;
  content?: T;
  parentId?: string;
}

interface ClockInterface {
  id: string;
  counter: number;
}

export interface SerializedOperation<T> {
  operationType: string;
  id: string;
  clock: ClockInterface;
  content?: T;
  parentId?: string;
}

export abstract class Operation<T> {
  operationType: string;
  id: string;
  clock: Clock;

  constructor(operationType: string, id: string, clock: Clock) {
    this.operationType = operationType;
    this.id = id;
    this.clock = clock;
  }

  abstract doOperation(tree: Tree<T>): OperationLog<T>;
  abstract undoOperation(tree: Tree<T>, log: OperationLog<T>): void;
  abstract redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T>;
}

export class OperationAdd<T> extends Operation<T> {
  content: T;
  parentId: string;

  constructor(input: OperationInput<T>) {
    super('add', input.id, input.clock);
    this.content = input.content;
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    tree.addNode(this.id, this.parentId, this.content);
    return { operation: this };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.removeNode(log.operation.id);
  }

  redoOperation(tree: Tree<T>, log?: OperationLog<T>): OperationLog<T> {
    tree.attachNode(log.operation.id, this.parentId);
    return { operation: this };
  }
}

export class OperationDelete<T> extends Operation<T> {
  constructor(input: OperationInput<T>) {
    super('delete', input.id, input.clock);
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id);
    const oldParentId = node.parentId;
    tree.removeNode(this.id);
    return { operation: this, oldParentId: oldParentId };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.attachNode(log.operation.id, log.oldParentId);
  }

  redoOperation(tree: Tree<T>, log?: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }
}

export class OperationMove<T> extends Operation<T> {
  parentId: string;

  constructor(input: OperationInput<T>) {
    super('move', input.id, input.clock);
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id);
    const oldParentId = node.parentId;

    tree.removeNode(this.id);
    tree.attachNode(this.id, this.parentId);
    return { operation: this, oldParentId };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.removeNode(log.operation.id);
    tree.attachNode(log.operation.id, log.oldParentId);
  }

  redoOperation(tree: Tree<T>, log?: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }
}

export class OperationUpdate<T> extends Operation<T> {
  content: T;

  constructor(input: OperationInput<T>) {
    super('update', input.id, input.clock);
    this.content = input.content;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id);
    const oldContent = node.content;
    tree.updateNode(this.id, this.content);
    return { operation: this, oldContent };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.updateNode(log.operation.id, log.oldContent);
  }

  redoOperation(tree: Tree<T>, log?: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }
}
