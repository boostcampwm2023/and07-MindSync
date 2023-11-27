package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.ui.util.Dp

class Tree {
    private val _nodes = mutableMapOf<String, Node>()
    val nodes get() = _nodes.toMap()

    init {
        _nodes[ROOT_ID] =
            CircleNode(
                id = ROOT_ID,
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
        return _nodes[id] ?: throw IllegalArgumentException(ERROR_MESSAGE_INVALID_NODE_ID)
    }

    fun addNode(
        targetId: String,
        parentId: String?,
        content: String,
    ) {
        if (_nodes[targetId] != null) throw IllegalArgumentException(ERROR_MESSAGE_DUPLICATED_NODE)
        if (parentId == null) throw IllegalArgumentException(ERROR_MESSAGE_PARENT_NODE_NOT_EXIST)
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
        if (targetId == ROOT_ID || parentId == null) return
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
        if (targetId == ROOT_ID) throw IllegalArgumentException(ERROR_MESSAGE_ROOT_CANT_REMOVE)
        val targetNode = _nodes[targetId] ?: throw IllegalArgumentException(ERROR_MESSAGE_TARGET_NODE_NOT_EXIST)
        targetNode.parentId?.let { parentId ->
            val parentNode =
                _nodes[parentId] ?: throw IllegalArgumentException(ERROR_MESSAGE_PARENT_NODE_NOT_EXIST)
            val newChildren = parentNode.children.filter { node -> node.id != targetId }
            val newParent =
                when (parentNode) {
                    is CircleNode -> parentNode.copy(children = newChildren)

                    is RectangleNode -> parentNode.copy(children = newChildren)
                }
            _nodes[parentId] = newParent
        } ?: throw IllegalArgumentException(ERROR_MESSAGE_ROOT_CANT_REMOVE)
    }

    fun updateNode(
        targetId: String,
        description: String,
    ) {
        val targetNode =
            _nodes[targetId] ?: throw IllegalArgumentException(ERROR_MESSAGE_TARGET_NODE_NOT_EXIST)
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

    companion object {
        private const val ROOT_ID = "root"
        private const val ERROR_MESSAGE_INVALID_NODE_ID = "Node Id is invalid"
        private const val ERROR_MESSAGE_DUPLICATED_NODE = "Target node is duplicated"
        private const val ERROR_MESSAGE_TARGET_NODE_NOT_EXIST = "Target Node is not exist"
        private const val ERROR_MESSAGE_PARENT_NODE_NOT_EXIST = "Parent Node is not exist"
        private const val ERROR_MESSAGE_ROOT_CANT_REMOVE = "Root can't remove"
    }
}
