import { Clock, COMPARE } from './clock';
import {
  Operation,
  OperationAdd,
  OperationAddInput,
  OperationDelete,
  OperationInput,
  OperationLog,
  OperationMove,
  OperationMoveInput,
  OperationUpdate,
  OperationUpdateInput,
} from './operation';
import { Tree } from './tree';
import { Node } from './node';

export class CrdtTree<T> {
  operationLogs: OperationLog<T>[] = [];
  clock: Clock;
  tree = new Tree<T>();

  constructor(id: string) {
    this.clock = new Clock(id);
  }

  get(id: string): Node<T> | undefined {
    return this.tree.get(id);
  }

  addLog(log: OperationLog<T>) {
    this.operationLogs.push(log);
  }

  generateOperationAdd(
    targetId: string,
    parentId: string,
    description: T,
  ): OperationAdd<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationAddInput<T> = {
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
    const input: OperationInput = {
      id: targetId,
      clock,
    };
    return new OperationDelete<T>(input);
  }

  generateOperationMove(targetId: string, parentId: string): OperationMove<T> {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationMoveInput = {
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
    const input: OperationUpdateInput<T> = {
      id: targetId,
      description,
      clock,
    };
    return new OperationUpdate<T>(input);
  }

  applyOperation(operation: Operation<T>) {
    this.clock = this.clock.merge(operation.clock);

    if (this.operationLogs.length === 0) {
      const log = operation.doOperation(this.tree);
      this.addLog(log);
      return;
    }

    const lastOperation =
      this.operationLogs[this.operationLogs.length - 1].operation;
    if (operation.clock.compare(lastOperation.clock) === COMPARE.LESS) {
      const prevLog = this.operationLogs.pop();
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

  static parse<T>(json: string) {
    const parsedJson = JSON.parse(json);
    const crdtTree = new CrdtTree('0');
    crdtTree.clock = Clock.parse(JSON.stringify(parsedJson.clock));
    crdtTree.tree = Tree.parse<T>(JSON.stringify(parsedJson.tree));

    const operationTypeMap = {
      add: OperationAdd.parse<T>,
      delete: OperationDelete.parse<T>,
      move: OperationMove.parse<T>,
      update: OperationUpdate.parse<T>,
    };

    const parsedOperationLogs = parsedJson.operationLogs.map(
      (operationLog: OperationLog<T>) => {
        const operationType = operationLog.operation.operationType;
        operationLog.operation = operationTypeMap[operationType](
          operationLog.operation,
        );
        return operationLog;
      },
    );
    crdtTree.operationLogs = parsedOperationLogs;
    return crdtTree;
  }
}
