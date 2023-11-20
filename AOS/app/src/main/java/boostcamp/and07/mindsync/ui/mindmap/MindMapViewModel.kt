package boostcamp.and07.mindsync.ui.mindmap

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.RectanglePath
import boostcamp.and07.mindsync.ui.util.Dp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class MindMapViewModel : ViewModel() {
    private var _head = MutableStateFlow<Node>(
        CircleNode(
            path = CirclePath(
                Dp(100f),
                Dp(500f),
                Dp(50f),
            ),
            "Root",
            listOf(),
        ),
    )
    val head: StateFlow<Node> = _head
    private var _selectedNode = MutableStateFlow<Node?>(null)
    val selectedNode: StateFlow<Node?> = _selectedNode

    fun addNode(parent: Node) {
        _head.value?.let { head ->
            _head.value = traverseAddNode(
                head,
                parent,
                RectangleNode(
                    RectanglePath(Dp(200f), Dp(100f), Dp(50f), Dp(50f)),
                    "Child1",
                    listOf(),
                ),
            )
        }
    }

    fun removeNode(target: Node) {
        _head.value?.let { head ->
            _head.value = traverseRemoveNode(head, target as RectangleNode)
        }
    }

    fun selectNode(selectNode: Node?) {
        _selectedNode.value = selectNode
    }

    private fun traverseAddNode(node: Node, target: Node, addNode: RectangleNode): Node {
        val newNodes = node.nodes.toMutableList()
        if (node == target) {
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

    private fun traverseRemoveNode(node: Node, removeNode: RectangleNode): Node {
        val newNodes = node.nodes.toMutableList()
        if (node == removeNode) {
            newNodes.clear()
        } else {
            newNodes.clear()
            node.nodes.forEach { child ->
                newNodes.add(traverseRemoveNode(child, removeNode) as RectangleNode)
            }
        }
        return when (node) {
            is RectangleNode -> node.copy(nodes = newNodes)
            is CircleNode -> node.copy(nodes = newNodes)
        }
    }
}
