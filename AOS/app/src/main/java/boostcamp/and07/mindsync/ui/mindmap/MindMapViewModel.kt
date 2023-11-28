package boostcamp.and07.mindsync.ui.mindmap

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.crdt.CrdtTree
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.network.MindMapSocketManager
import boostcamp.and07.mindsync.network.SocketEvent
import boostcamp.and07.mindsync.network.SocketState
import boostcamp.and07.mindsync.ui.util.Dp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MindMapViewModel : ViewModel() {
    private val _tree = MutableStateFlow(Tree())
    val tree: StateFlow<Tree> = _tree
    private var _selectedNode = MutableStateFlow<Node?>(null)
    val selectedNode: StateFlow<Node?> = _selectedNode

    private val mindMapSocketManager = MindMapSocketManager()
    private val _socketState = MutableStateFlow(SocketState.DISCONNECT)
    val socketState: StateFlow<SocketState> = _socketState
    private val _socketEvent = MutableStateFlow<SocketEvent?>(null)
    val socketEvent: StateFlow<SocketEvent?> = _socketEvent

    init {
        setSocketState()
        setSocketEvent()
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
            }
        }
    }

    fun joinBoard(boardId: String) {
        mindMapSocketManager.joinBoard(boardId)
    }

    fun addNode(
        parent: Node,
        addNode: RectangleNode,
    ) {
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.addNode(addNode.id, parent.id, addNode.description)
        _tree.value = newTree
    }

    fun removeNode(target: Node) {
        _selectedNode.value = null
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.removeNode(target.id)
        _tree.value = newTree
    }

    fun setSelectedNode(selectNode: Node?) {
        _selectedNode.value = selectNode
    }

    fun updateMindMap(boardId: String) {
        val testTree = CrdtTree("1")
        val testTargetId = "a"
        val testParentId = "root"
        val testDescription = "hello"
        val operation = testTree.generateOperationAdd(testTargetId, testParentId, testDescription)
        val serializedOperation = testTree.serializeOperationAdd(operation)
        mindMapSocketManager.updateMindMap(serializedOperation = serializedOperation, boardId = boardId)
    }

    fun updateNode(updateNode: Node) {
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.updateNode(updateNode.id, updateNode.description)
        _tree.value = newTree
    }

    fun update(newTree: Tree) {
        _tree.value = newTree
    }

    fun changeRootY(windowHeight: Dp) {
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.setRootNode(
            _tree.value.getRootNode().copy(
                path = _tree.value.getRootNode().path.copy(centerY = windowHeight),
            ),
        )
        _tree.value = newTree
    }
}
