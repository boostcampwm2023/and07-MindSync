import { Clock } from './clock';
import { Tree } from './tree';

export interface OperationLog<T> {
  operation: Operation<T>;
  oldParentId?: string;
  oldDescription?: T;
}

export interface OperationInput<T> {
  id: string;
  clock: Clock;
  description?: T;
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
  description?: T;
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
  description: T;
  parentId: string;

  constructor(input: OperationInput<T>) {
    super('add', input.id, input.clock);
    this.description = input.description;
    this.parentId = input.parentId;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    tree.addNode(this.id, this.parentId, this.description);
    return { operation: this };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.removeNode(log.operation.id);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    tree.attachNode(log.operation.id, this.parentId);
    return { operation: this };
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationAdd<T> {
    const input: OperationInput<T> = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId,
      description: serializedOperation.description,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationAdd<T>(input);
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

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationDelete<T> {
    const input: OperationInput<T> = {
      id: serializedOperation.id,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationDelete<T>(input);
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

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationMove<T> {
    const input: OperationInput<T> = {
      id: serializedOperation.id,
      parentId: serializedOperation.parentId,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationMove<T>(input);
  }
}

export class OperationUpdate<T> extends Operation<T> {
  description: T;

  constructor(input: OperationInput<T>) {
    super('update', input.id, input.clock);
    this.description = input.description;
  }

  doOperation(tree: Tree<T>): OperationLog<T> {
    const node = tree.get(this.id);
    const oldDescription = node.description;
    tree.updateNode(this.id, this.description);
    return { operation: this, oldDescription: oldDescription };
  }

  undoOperation(tree: Tree<T>, log: OperationLog<T>): void {
    tree.updateNode(log.operation.id, log.oldDescription);
  }

  redoOperation(tree: Tree<T>, log: OperationLog<T>): OperationLog<T> {
    const redoLog = log.operation.doOperation(tree);
    return redoLog;
  }

  static parse<T>(
    serializedOperation: SerializedOperation<T>,
  ): OperationUpdate<T> {
    const input: OperationInput<T> = {
      id: serializedOperation.id,
      description: serializedOperation.description,
      clock: new Clock(
        serializedOperation.clock.id,
        serializedOperation.clock.counter,
      ),
    };
    return new OperationUpdate<T>(input);
  }
}
