package boostcamp.and07.mindsync.data.crdt

import boostcamp.and07.mindsync.data.model.Tree
import kotlinx.serialization.Serializable

data class OperationLog(
    val operation: Operation,
    val oldDescription: String? = null,
    val oldParentId: String? = null,
)

data class OperationInput(
    val id: String,
    val clock: Clock,
    val description: String? = null,
    val parentId: String? = null,
)

@Serializable
data class SerializedOperation(
    val operationType: String,
    val id: String,
    val clock: Clock,
    val description: String? = null,
    val parentId: String? = null,
)

enum class OperationType(val command: String) {
    ADD("add"),
    DELETE("delete"),
    MOVE("move"),
    UPDATE("update"),
}

sealed class Operation(val operationType: String, val id: String, val clock: Clock) {
    abstract fun doOperation(tree: Tree): OperationLog

    abstract fun undoOperation(
        tree: Tree,
        log: OperationLog,
    )

    abstract fun redoOperation(
        tree: Tree,
        log: OperationLog,
    ): OperationLog
}

class OperationAdd(input: OperationInput) :
    Operation(OperationType.ADD.command, input.id, input.clock) {
    val parentId = input.parentId
    val description = input.description

    override fun doOperation(tree: Tree): OperationLog {
        description?.let { description ->
            tree.addNode(id, parentId, description)
        }
        return OperationLog(this)
    }

    override fun undoOperation(
        tree: Tree,
        log: OperationLog,
    ) {
        tree.removeNode(log.operation.id)
    }

    override fun redoOperation(
        tree: Tree,
        log: OperationLog,
    ): OperationLog {
        tree.attachNode(log.operation.id, parentId)
        return OperationLog(this)
    }
}

class OperationDelete(input: OperationInput) :
    Operation(OperationType.DELETE.command, input.id, input.clock) {
    override fun doOperation(tree: Tree): OperationLog {
        val node = tree.getNode(id)
        val oldParentId = node.parentId
        tree.removeNode(id)
        return OperationLog(this, oldParentId = oldParentId)
    }

    override fun undoOperation(
        tree: Tree,
        log: OperationLog,
    ) {
        tree.attachNode(log.operation.id, log.oldParentId)
    }

    override fun redoOperation(
        tree: Tree,
        log: OperationLog,
    ) = log.operation.doOperation(tree)
}

class OperationMove(input: OperationInput) :
    Operation(OperationType.MOVE.command, input.id, input.clock) {
    val parentId = input.parentId

    override fun doOperation(tree: Tree): OperationLog {
        val node = tree.getNode(id)
        val oldParentId = node.parentId
        tree.removeNode(id)
        tree.attachNode(id, parentId)
        return OperationLog(this, oldParentId = oldParentId)
    }

    override fun undoOperation(
        tree: Tree,
        log: OperationLog,
    ) {
        tree.removeNode(log.operation.id)
        tree.attachNode(log.operation.id, log.oldParentId)
    }

    override fun redoOperation(
        tree: Tree,
        log: OperationLog,
    ) = log.operation.doOperation(tree)
}

class OperationUpdate(input: OperationInput) :
    Operation(OperationType.UPDATE.command, input.id, input.clock) {
    val description = input.description

    override fun doOperation(tree: Tree): OperationLog {
        val node = tree.getNode(id)
        val oldDescription = node.description
        description?.let { description ->
            tree.updateNode(id, description)
        }
        return OperationLog(this, oldDescription = oldDescription)
    }

    override fun undoOperation(
        tree: Tree,
        log: OperationLog,
    ) {
        log.oldDescription?.let { oldDescription ->
            tree.updateNode(log.operation.id, oldDescription)
        }
    }

    override fun redoOperation(
        tree: Tree,
        log: OperationLog,
    ) = log.operation.doOperation(tree)
}
