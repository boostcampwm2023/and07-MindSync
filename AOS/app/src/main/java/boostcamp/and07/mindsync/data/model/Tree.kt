package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.ui.util.Dp

class Tree {
    private val _nodes = mutableMapOf<String, Node>()
    val nodes get() = _nodes.toMap()

    init {
        _nodes["root"] =
            CircleNode(
                id = "root",
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
        val newChildren = parentNode.children.toMutableList()
        newChildren.add(newNode)
        val newParent =
            when (parentNode) {
                is CircleNode -> parentNode.copy(children = newChildren)
                is RectangleNode -> parentNode.copy(children = newChildren)
            }
        _nodes[parentId] = newParent
        _nodes[targetId] = newNode
    }

    fun attachNode(
        targetId: String,
        parentId: String?,
    ) {
        if (targetId == "root" || parentId == null) return
        val targetNode = nodes[targetId] ?: return

        val newTargetNode =
            when (targetNode) {
                is CircleNode -> targetNode.copy(parentId = parentId)
                is RectangleNode -> targetNode.copy(parentId = parentId)
            }
        val parentNode = nodes[parentId] ?: return
        val newNodes = parentNode.children.toMutableList()
        newNodes.add(newTargetNode as RectangleNode)
        val newParentNode =
            when (parentNode) {
                is CircleNode -> parentNode.copy(children = newNodes)
                is RectangleNode -> parentNode.copy(children = newNodes)
            }

        _nodes[targetId] = newTargetNode
        _nodes[parentId] = newParentNode
    }

    fun removeNode(targetId: String) {
        if (targetId == "root") throw IllegalArgumentException("Root can't remove")
        val targetNode = _nodes[targetId] ?: throw IllegalArgumentException("Target Node is not exist")
        targetNode.parentId?.let { parentId ->
            val parentNode =
                _nodes[parentId] ?: throw IllegalArgumentException("Parent node is not exist")
            val newChildren = parentNode.children.filter { node -> node.id != targetId }
            val newParent =
                when (parentNode) {
                    is CircleNode -> parentNode.copy(children = newChildren)

                    is RectangleNode -> parentNode.copy(children = newChildren)
                }
            _nodes[parentId] = newParent
        } ?: throw IllegalArgumentException("Root can't remove")
    }

    fun updateNode(
        targetId: String,
        description: String,
    ) {
        val targetNode =
            _nodes[targetId] ?: throw IllegalArgumentException("Target Node is not exist")
        val newTargetNode =
            when (targetNode) {
                is CircleNode -> targetNode.copy(description = description)
                is RectangleNode -> targetNode.copy(description = description)
            }
        _nodes[targetId] = newTargetNode
        targetNode.parentId ?: return
        _nodes[targetNode.parentId]?.let { parent ->
            val newChildren = mutableListOf<RectangleNode>()
            for (i in 0 until parent.children.size) {
                if (parent.children[i].id == targetId) {
                    newChildren.add(newTargetNode as RectangleNode)
                } else {
                    newChildren.add(parent.children[i])
                }
            }
        }
    }
}
