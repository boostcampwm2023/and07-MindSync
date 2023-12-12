package boostcamp.and07.mindsync.data.network.response.mindmap

import boostcamp.and07.mindsync.data.IdGenerator
import boostcamp.and07.mindsync.data.crdt.CrdtTree
import boostcamp.and07.mindsync.data.crdt.Operation
import boostcamp.and07.mindsync.data.crdt.OperationAdd
import boostcamp.and07.mindsync.data.crdt.OperationDelete
import boostcamp.and07.mindsync.data.crdt.OperationInput
import boostcamp.and07.mindsync.data.crdt.OperationLog
import boostcamp.and07.mindsync.data.crdt.OperationMove
import boostcamp.and07.mindsync.data.crdt.OperationType
import boostcamp.and07.mindsync.data.crdt.OperationUpdate
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.util.ExceptionMessage

fun SerializedCrdtTree.toCrdtTree(): CrdtTree {
    return CrdtTree(
        id = IdGenerator.makeRandomNodeId(),
        operationLog =
            operationLogs?.map {
                    serializedOperationLog ->
                serializedOperationLog.toOperationLog()
            }?.toMutableList() ?: mutableListOf(),
        clock = clock,
        tree = tree.toTree(),
    )
}

fun SerializedOperation.toOperationInput(): OperationInput {
    return OperationInput(
        id = id,
        clock = clock,
        description = description,
        parentId = parentId,
    )
}

fun SerializedOperation.toOperation(): Operation {
    val operationInput = toOperationInput()
    return when (operationType) {
        OperationType.ADD.command -> {
            OperationAdd(operationInput)
        }
        OperationType.DELETE.command -> {
            OperationDelete(operationInput)
        }
        OperationType.MOVE.command -> {
            OperationMove(operationInput)
        }
        OperationType.UPDATE.command -> {
            OperationUpdate(operationInput)
        }
        else -> {
            throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_NOT_DEFINED_OPERATION.message + operationType)
        }
    }
}

fun SerializedOperationLog.toOperationLog(): OperationLog {
    return OperationLog(
        operation = operation.toOperation(),
        oldDescription = oldDescription,
        oldParentId = oldParentId,
    )
}

fun NodeDto.toNode(): Node {
    return if (targetId == "root") {
        CircleNode(
            id = targetId,
            parentId = null,
            description = description,
            children = children,
        )
    } else {
        RectangleNode(
            id = targetId,
            parentId = parentId,
            description = description,
            children = children,
        )
    }
}

fun SerializedTree.toTree(): Tree {
    val treemap = mutableMapOf<String, Node>()
    nodes.forEach { node ->
        treemap[node.targetId] = node.toNode()
    }
    return Tree(treemap)
}
