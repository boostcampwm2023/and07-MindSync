package boostcamp.and07.mindsync.data.crdt

import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.Tree

class CrdtTree(id: String) {
    private var operationLog: MutableList<OperationLog> = mutableListOf()
    private var clock: Clock = Clock(id)
    var tree: Tree = Tree()

    fun get(id: String): Node {
        return tree.getNode(id)
    }

    fun addLog(log: OperationLog) {
        operationLog.add(log)
    }

    fun generateOperationAdd(
        targetId: String,
        parentId: String,
        description: String,
    ): OperationAdd {
        clock.increment()
        val input = OperationInput(targetId, clock.copy(), description, parentId)
        return OperationAdd(input)
    }

    fun generateOperationDelete(targetId: String): OperationDelete {
        clock.increment()
        val input = OperationInput(targetId, clock.copy())
        return OperationDelete(input)
    }

    fun generateOperationMove(
        targetId: String,
        parentId: String,
    ): OperationMove {
        clock.increment()
        val input = OperationInput(targetId, clock.copy(), parentId = parentId)
        return OperationMove(input)
    }

    fun generateOperationUpdate(
        targetId: String,
        description: String,
    ): OperationUpdate {
        clock.increment()
        val input = OperationInput(targetId, clock.copy(), description = description)
        return OperationUpdate(input)
    }

    fun serializeOperationAdd(operation: OperationAdd): SerializedOperation {
        return SerializedOperation(
            operationType = "add",
            id = operation.id,
            clock = clock.copy(id = operation.clock.id, counter = operation.clock.counter),
            description = operation.description,
            parentId = operation.parentId,
        )
    }

    fun serializeOperationDelete(operation: OperationDelete): SerializedOperation {
        return SerializedOperation(
            operationType = "delete",
            id = operation.id,
            clock = clock.copy(id = operation.clock.id, counter = operation.clock.counter),
        )
    }

    fun serializeOperationMove(operation: OperationMove): SerializedOperation {
        return SerializedOperation(
            operationType = "move",
            id = operation.id,
            clock = clock.copy(id = operation.clock.id, counter = operation.clock.counter),
            parentId = operation.parentId,
        )
    }

    fun serializeOperationUpdate(operation: OperationUpdate): SerializedOperation {
        return SerializedOperation(
            operationType = "update",
            id = operation.id,
            clock = clock.copy(id = operation.clock.id, counter = operation.clock.counter),
            description = operation.description,
        )
    }

    fun deserializeOperationAdd(serializedOperation: SerializedOperation): OperationAdd {
        val input =
            OperationInput(
                id = serializedOperation.id,
                parentId = serializedOperation.parentId,
                description = serializedOperation.description,
                clock =
                    Clock(
                        serializedOperation.clock.id,
                        serializedOperation.clock.counter,
                    ),
            )
        return OperationAdd(input)
    }

    fun deserializeOperationDelete(serializedOperation: SerializedOperation): OperationDelete {
        val input =
            OperationInput(
                id = serializedOperation.id,
                clock =
                    Clock(
                        serializedOperation.clock.id,
                        serializedOperation.clock.counter,
                    ),
            )
        return OperationDelete(input)
    }

    fun deserializeOperationMove(serializedOperation: SerializedOperation): OperationMove {
        val input =
            OperationInput(
                id = serializedOperation.id,
                parentId = serializedOperation.parentId,
                clock =
                    Clock(
                        serializedOperation.clock.id,
                        serializedOperation.clock.counter,
                    ),
            )
        return OperationMove(input)
    }

    fun deserializeOperationUpdate(serializedOperation: SerializedOperation): OperationUpdate {
        val input =
            OperationInput(
                id = serializedOperation.id,
                description = serializedOperation.description,
                clock =
                    Clock(
                        serializedOperation.clock.id,
                        serializedOperation.clock.counter,
                    ),
            )
        return OperationUpdate(input)
    }

    fun applyOperation(operation: Operation) {
        clock = clock.merge(operation.clock)

        if (operationLog.isEmpty()) {
            val log = operation.doOperation(tree)
            addLog(log)
        } else {
            val lastOperation = operationLog.last().operation
            if (operation.clock < lastOperation.clock) {
                val prevLog = operationLog.removeAt(operationLog.size - 1)
                prevLog.operation.undoOperation(tree, prevLog)
                applyOperation(operation)
                val redoLog = prevLog.operation.redoOperation(tree, prevLog)
                addLog(redoLog)
            } else {
                val log = operation.doOperation(tree)
                addLog(log)
            }
        }
    }

    fun applyOperations(operations: List<Operation>) {
        for (operation in operations) {
            applyOperation(operation)
        }
    }
}
