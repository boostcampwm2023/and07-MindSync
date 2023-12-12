package boostcamp.and07.mindsync.ui.mindmap

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.IdGenerator
import boostcamp.and07.mindsync.data.crdt.CrdtTree
import boostcamp.and07.mindsync.data.crdt.Operation
import boostcamp.and07.mindsync.data.crdt.OperationAdd
import boostcamp.and07.mindsync.data.crdt.OperationDelete
import boostcamp.and07.mindsync.data.crdt.OperationMove
import boostcamp.and07.mindsync.data.crdt.OperationType
import boostcamp.and07.mindsync.data.crdt.OperationUpdate
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.data.network.MindMapSocketManager
import boostcamp.and07.mindsync.data.network.SocketEvent
import boostcamp.and07.mindsync.data.network.SocketEventType
import boostcamp.and07.mindsync.data.network.SocketState
import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedCrdtTree
import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedOperation
import boostcamp.and07.mindsync.data.repository.mindmap.MindMapRepository
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.ExceptionMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MindMapViewModel
    @Inject
    constructor(
        private val mindMapRepository: MindMapRepository,
    ) : ViewModel() {
        private var boardId: String = ""
        val crdtTree = CrdtTree(IdGenerator.makeRandomNodeId())
        private var _selectedNode = MutableStateFlow<Node?>(null)
        val selectedNode: StateFlow<Node?> = _selectedNode
        private val _operation = MutableStateFlow<Operation?>(null)
        val operation: StateFlow<Operation?> = _operation
        private val mindMapSocketManager = MindMapSocketManager()
        private val _socketState = MutableStateFlow(SocketState.DISCONNECT)
        val socketState: StateFlow<SocketState> = _socketState
        private val _socketEvent = MutableStateFlow<SocketEvent?>(null)
        val socketEvent: StateFlow<SocketEvent?> = _socketEvent

        init {
            setSocketState()
            setSocketEvent()
        }

        fun setBoardId(boardId: String) {
            if (this.boardId != boardId) {
                this.boardId = boardId
                joinBoard(boardId, boardName)
            }
        }

        private fun setSocketState() {
            viewModelScope.launch {
                mindMapSocketManager.listenState().collectLatest { state ->
                    _socketState.value = state
                }
            }
        }

        private fun setSocketEvent() {
            viewModelScope.launch {
                mindMapSocketManager.listenEvent().collectLatest { event ->
                    _socketEvent.value = event
                    when (event.eventType) {
                        SocketEventType.OPERATION_FROM_SERVER -> {
                            when (val operation = event.operation) {
                                is SerializedOperation -> {
                                    applyOperation(operation)
                                }

                                is SerializedCrdtTree -> {
                                    applyOperation(operation)
                                }
                            }
                        }
                    }
                }
            }
        }

        fun joinBoard(
            boardId: String,
            boardName: String,
        ) {
            mindMapSocketManager.joinBoard(boardId, boardName)
        }

        fun addNode(
            parent: Node,
            addNode: RectangleNode,
        ) {
            val addOperation =
                crdtTree.generateOperationAdd(addNode.id, parent.id, addNode.description)
            crdtTree.applyOperation(addOperation)
            _operation.value = addOperation
            requestUpdateMindMap(operation = addOperation)
        }

        fun removeNode(target: Node) {
            _selectedNode.value = null
            val removeOperation = crdtTree.generateOperationDelete(target.id)
            crdtTree.applyOperation(removeOperation)
            _operation.value = removeOperation
            requestUpdateMindMap(operation = removeOperation)
        }

        fun moveNode(
            tree: Tree,
            target: Node,
            parent: Node,
        ) {
            this.crdtTree.tree = tree
            val moveOperation = crdtTree.generateOperationMove(target.id, parent.id)
            crdtTree.applyOperation(moveOperation)
            _operation.value = moveOperation
            requestUpdateMindMap(operation = moveOperation)
        }

        fun setSelectedNode(selectNode: Node?) {
            _selectedNode.value = selectNode
        }

        fun requestUpdateMindMap(operation: Operation) {
            val serializedOperation =
                when (operation) {
                    is OperationAdd -> crdtTree.serializeOperationAdd(operation)

                    is OperationDelete -> crdtTree.serializeOperationDelete(operation)

                    is OperationMove -> crdtTree.serializeOperationMove(operation)

                    is OperationUpdate -> crdtTree.serializeOperationUpdate(operation)
                }
            mindMapSocketManager.updateMindMap(
                serializedOperation = serializedOperation,
                boardId = boardId,
            )
        }

        fun applyOperation(operation: SerializedOperation) {
            val operation =
                when (operation.operationType) {
                    OperationType.ADD.command -> crdtTree.deserializeOperationAdd(operation)
                    OperationType.DELETE.command -> crdtTree.deserializeOperationDelete(operation)
                    OperationType.UPDATE.command -> crdtTree.deserializeOperationUpdate(operation)
                    OperationType.MOVE.command -> crdtTree.deserializeOperationMove(operation)
                    else -> {
                        throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_NOT_DEFINED_OPERATION.message)
                    }
                }
            crdtTree.applyOperation(operation)
            _operation.value = operation
        }

        fun applyOperation(operation: SerializedCrdtTree) {
            operation.operationLogs?.forEach { operationLog ->
                val operation =
                    when (operationLog.operation.operationType) {
                        OperationType.ADD.command -> crdtTree.deserializeOperationAdd(operationLog.operation)
                        OperationType.DELETE.command -> crdtTree.deserializeOperationDelete(operationLog.operation)
                        OperationType.UPDATE.command -> crdtTree.deserializeOperationUpdate(operationLog.operation)
                        OperationType.MOVE.command -> crdtTree.deserializeOperationMove(operationLog.operation)
                        else -> {
                            throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_NOT_DEFINED_OPERATION.message)
                        }
                    }
                crdtTree.applyOperation(operation)
                _operation.value = operation
            }
        }

        fun updateNode(updateNode: Node) {
            val updateOperation =
                crdtTree.generateOperationUpdate(updateNode.id, updateNode.description)
            crdtTree.applyOperation(updateOperation)
            _operation.value = updateOperation
            requestUpdateMindMap(updateOperation)
        }

        fun update(newTree: Tree) {
            crdtTree.tree = newTree
        }

        fun changeRootXY(
            windowWidth: Dp,
            windowHeight: Dp,
        ) {
            crdtTree.tree.setRootNode(
                crdtTree.tree.getRootNode().copy(
                    path = crdtTree.tree.getRootNode().path.copy(centerX = windowWidth, centerY = windowHeight),
                ),
            )
        }
    }
