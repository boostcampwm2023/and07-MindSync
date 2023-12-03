import { Clock, COMPARE } from './clock';
import {
  Operation,
  OperationAdd,
  OperationDelete,
  OperationInput,
  OperationLog,
  OperationMove,
  OperationUpdate,
  SerializedOperation,
} from './operation';
import { Tree } from './tree';
import { Node } from './node';

export class CrdtTree<T> {
  operationLog: OperationLog<T>[] = [];
  clock: Clock;
  tree = new Tree<T>();

  constructor(id: string) {
    this.clock = new Clock(id);
  }

  get(id: string): Node<T> | undefined {
    return this.tree.get(id);
  }

  addLog(log: OperationLog<T>) {
    this.operationLog.push(log);
  }

  generateOperationAdd(
    targetId: string,
    parentId: string,
    description: T,
  ): OperationAdd<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationInput<T> = {
      id: targetId,
      parentId,
      description,
      clock,
    };
    return new OperationAdd<T>(input);
  }

  generateOperationDelete(targetId: string): OperationDelete<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationInput<T> = {
      id: targetId,
      clock,
    };
    return new OperationDelete<T>(input);
  }

  generateOperationMove(targetId: string, parentId: string): OperationMove<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationInput<T> = {
      id: targetId,
      parentId,
      clock,
    };
    return new OperationMove<T>(input);
  }

  generateOperationUpdate(
    targetId: string,
    description: T,
  ): OperationUpdate<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationInput<T> = {
      id: targetId,
      description,
      clock,
    };
    return new OperationUpdate<T>(input);
  }

  serializeOperationAdd(operation: OperationAdd<T>): SerializedOperation<T> {
    const serializedOperation: SerializedOperation<T> = {
      operationType: 'add',
      id: operation.id,
      clock: { id: operation.clock.id, counter: operation.clock.counter },
      description: operation.description,
      parentId: operation.parentId,
    };
    return serializedOperation;
  }

  serializeOperationDelete(
    operation: OperationDelete<T>,
  ): SerializedOperation<T> {
    const serializedOperation: SerializedOperation<T> = {
      operationType: 'delete',
      id: operation.id,
      clock: { id: operation.clock.id, counter: operation.clock.counter },
    };
    return serializedOperation;
  }

  serializeOperationMove(operation: OperationMove<T>): SerializedOperation<T> {
    const serializedOperation: SerializedOperation<T> = {
      operationType: 'move',
      id: operation.id,
      clock: { id: operation.clock.id, counter: operation.clock.counter },
      parentId: operation.parentId,
    };
    return serializedOperation;
  }

  serializeOperationUpdate(
    operation: OperationUpdate<T>,
  ): SerializedOperation<T> {
    const serializedOperation: SerializedOperation<T> = {
      operationType: 'update',
      id: operation.id,
      clock: { id: operation.clock.id, counter: operation.clock.counter },
      description: operation.description,
    };
    return serializedOperation;
  }

  deserializeOperationAdd(
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

  deserializeOperationDelete(
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

  deserializeOperationMove(
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

  deserializeOperationUpdate(
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

  applyOperation(operation: Operation<T>) {
    this.clock = this.clock.merge(operation.clock);

    if (this.operationLog.length === 0) {
      const log = operation.doOperation(this.tree);
      this.addLog(log);
      return;
    }

    const lastOperation =
      this.operationLog[this.operationLog.length - 1].operation;
    if (operation.clock.compare(lastOperation.clock) === COMPARE.LESS) {
      const prevLog = this.operationLog.pop();
      prevLog.operation.undoOperation(this.tree, prevLog);
      this.applyOperation(operation);
      const redoLog = prevLog.operation.redoOperation(this.tree, prevLog);
      this.addLog(redoLog);
    } else {
      const log = operation.doOperation(this.tree);
      this.addLog(log);
    }
  }

  applyOperations(operations: Operation<T>[]) {
    for (const operation of operations) this.applyOperation(operation);
  }
}
