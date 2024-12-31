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

export class CrdtTree {
  operationLogs: OperationLog[] = [];
  clock: Clock;
  tree = new Tree();

  constructor(id: string) {
    this.clock = new Clock(id);
  }

  get(id: string): Node | undefined {
    return this.tree.get(id);
  }

  addLog(log: OperationLog) {
    this.operationLogs.push(log);
  }

  generateOperationAdd(
    targetId: string,
    parentId: string,
    description: string,
  ): OperationAdd {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationAddInput = {
      id: targetId,
      parentId,
      description,
      clock,
    };
    return new OperationAdd(input);
  }

  generateOperationDelete(targetId: string): OperationDelete {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationInput = {
      id: targetId,
      clock,
    };
    return new OperationDelete(input);
  }

  generateOperationMove(targetId: string, parentId: string): OperationMove {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationMoveInput = {
      id: targetId,
      parentId,
      clock,
    };
    return new OperationMove(input);
  }

  generateOperationUpdate(
    targetId: string,
    description: string,
  ): OperationUpdate {
    this.clock.increment();
    const clock = this.clock.copy();
    const input: OperationUpdateInput = {
      id: targetId,
      description,
      clock,
    };
    return new OperationUpdate(input);
  }

  applyOperation(operation: Operation) {
    this.clock = this.clock.merge(operation.clock);

    if (this.operationLogs.length === 0) {
      const log = operation.doOperation(this.tree);
      this.addLog(log);
      return;
    }

    const lastOperation =
      this.operationLogs[this.operationLogs.length - 1].operation;
    if (operation.clock.compare(lastOperation.clock) === COMPARE.LESS) {
      const prevLog = this.operationLogs.pop() as OperationLog;
      prevLog.operation.undoOperation(this.tree, prevLog);
      this.applyOperation(operation);
      const redoLog = prevLog.operation.redoOperation(this.tree, prevLog);
      this.addLog(redoLog);
    } else {
      const log = operation.doOperation(this.tree);
      this.addLog(log);
    }
  }

  applyOperations(operations: Operation[]) {
    for (const operation of operations) this.applyOperation(operation);
  }

  static parse(json: string) {
    const parsedJson = JSON.parse(json);
    const crdtTree = new CrdtTree('0');
    crdtTree.clock = Clock.parse(JSON.stringify(parsedJson.clock));
    crdtTree.tree = Tree.parse(JSON.stringify(parsedJson.tree));

    const operationTypeMap = {
      add: OperationAdd.parse,
      delete: OperationDelete.parse,
      move: OperationMove.parse,
      update: OperationUpdate.parse,
    };

    const parsedOperationLogs = parsedJson.operationLogs.map(
      (operationLog: OperationLog) => {
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
