package boostcamp.and07.mindsync.ui.mindmap

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.IdGenerator
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

class MindMapViewModel : ViewModel() {
    private val _head =
        MutableStateFlow<Node>(
            CircleNode(
                id = IdGenerator.makeRandomNodeId(),
                path =
                CirclePath(
                    Dp(100f),
                    Dp(500f),
                    Dp(50f),
                ),
                "Root1",
                listOf(),
            ),
        )
    val head: StateFlow<Node> = _head
    private var _selectedNode = MutableStateFlow<Node?>(null)
    val selectedNode: StateFlow<Node?> = _selectedNode

    fun addNode(
        parent: Node,
        addNode: RectangleNode,
    ) {
        _head.value =
            traverseAddNode(
                head.value,
                parent,
                addNode,
            )
    }

    fun removeNode(target: Node) {
        _selectedNode.value = null
        _head.value = traverseRemoveNode(head.value, target as RectangleNode)
    }

    fun setSelectedNode(selectNode: Node?) {
        _selectedNode.value = selectNode
    }

    private fun traverseAddNode(
        node: Node,
        target: Node,
        addNode: RectangleNode,
    ): Node {
        val newNodes = node.nodes.toMutableList()
        if (node.id == target.id) {
            newNodes.add(addNode)
        } else {
            newNodes.clear()
            node.nodes.forEach { child ->
                newNodes.add(traverseAddNode(child, target, addNode) as RectangleNode)
            }
        }
        return when (node) {
            is RectangleNode -> node.copy(nodes = newNodes)
            is CircleNode -> node.copy(nodes = newNodes)
        }
    }

    private fun traverseRemoveNode(
        node: Node,
        removeNode: RectangleNode,
    ): Node {
        val newNodes = node.nodes.toMutableList()
        newNodes.clear()
        node.nodes.forEach { child ->
            if (child.id != removeNode.id) {
                newNodes.add(traverseRemoveNode(child, removeNode) as RectangleNode)
            }
        }
        return when (node) {
            is RectangleNode -> node.copy(nodes = newNodes)
            is CircleNode -> node.copy(nodes = newNodes)
        }
    }

    fun updateNode(updateNode: Node) {
        _head.value = traverseUpdateNode(head.value, updateNode)
    }

    private fun traverseUpdateNode(
        node: Node,
        target: Node,
    ): Node {
        val newNodes = node.nodes.toMutableList()
        if (node.id == target.id) {
            return when (node) {
                is CircleNode -> node.copy(description = target.description)
                is RectangleNode -> node.copy(description = target.description)
            }
        }
        newNodes.clear()
        node.nodes.forEach { child ->
            newNodes.add(traverseUpdateNode(child, target) as RectangleNode)
        }
        return when (node) {
            is RectangleNode -> node.copy(nodes = newNodes)
            is CircleNode -> node.copy(nodes = newNodes)
        }
    }

    fun updateHead(newHead: Node) {
        _head.value = newHead
    }

    fun updateHead(windowHeight: Dp) {
        _head.update { root ->
            (root as CircleNode).copy(
                path = root.path.copy(centerY = windowHeight),
            )
        }
    }
}
