package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.data.IdGenerator
import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.ui.util.Dp

class Tree {
    private val _nodes = mutableMapOf<String, Node>()
    val nodes = _nodes.toMap()

    init {
        _nodes["root"] =
            CircleNode(
                id = IdGenerator.makeRandomNodeId(),
                parentId = null,
                path =
                    CirclePath(
                        Dp(100f),
                        Dp(500f),
                        Dp(50f),
                    ),
                "Root1",
                listOf(),
            )
    }

    fun get(id: String): Node {
        return _nodes[id] ?: throw IllegalArgumentException("Invalid Node Id")
    }

    fun addNode(
        targetId: String,
        parentId: String?,
        content: String,
    ) {
        if (_nodes[targetId] != null) throw IllegalArgumentException("Target node is exist")
        if (parentId == null) throw IllegalArgumentException("Parent is not exist")
        val newNode =
            NodeGenerator.makeNode(content, parentId).copy(id = targetId, parentId = parentId)
        val parentNode = _nodes[parentId] ?: return
        val newNodes = parentNode.children.toMutableList()
        newNodes.add(newNode)
        when (parentNode) {
            is CircleNode -> parentNode.copy(children = newNodes)
            is RectangleNode -> parentNode.copy(children = newNodes)
        }
        _nodes[parentId] = newNode
    }

    fun attachNode(
        targetId: String,
        parentId: String?,
    ) {
        if (targetId == "root" || parentId == null) return
        val targetNode = nodes[targetId] ?: return
        val parentNode = nodes[parentId] ?: return
        val newNodes = parentNode.children.toMutableList()
        newNodes.add(targetNode as RectangleNode)
        when (parentNode) {
            is CircleNode -> parentNode.copy(children = newNodes)
            is RectangleNode -> parentNode.copy(children = newNodes)
        }
        targetNode.copy(id = parentId)
        _nodes[targetId] = targetNode
        _nodes[parentId] = parentNode
    }

    fun removeNode(targetId: String) {
        if (targetId == "root") throw IllegalArgumentException("Root can't remove")
        val targetNode =
            _nodes.remove(targetId) ?: throw IllegalArgumentException("Target Node is not exist")
        targetNode.parentId?.let { parentId ->
            val parentNode =
                _nodes[parentId] ?: throw IllegalArgumentException("Parent node is not exist")
            val newNodes = parentNode.children.filter { node -> node.id == targetId }
            when (parentNode) {
                is CircleNode -> parentNode.copy(children = newNodes)

                is RectangleNode -> parentNode.copy(children = newNodes)
            }
            _nodes[parentId] = parentNode
        } ?: throw IllegalArgumentException("Root can't remove")
    }

    fun updateNode(
        targetId: String,
        description: String,
    ) {
        val targetNode =
            _nodes[targetId] ?: throw IllegalArgumentException("Target Node is not exist")
        when (targetNode) {
            is CircleNode -> targetNode.copy(description = description)
            is RectangleNode -> targetNode.copy(description = description)
        }
        _nodes[targetId] = targetNode
    }
}
