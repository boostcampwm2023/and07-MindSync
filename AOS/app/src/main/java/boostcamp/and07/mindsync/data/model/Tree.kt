package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.ExceptionMessage

class Tree {
    private var _nodes: MutableMap<String, Node>
    val nodes get() = _nodes.toMap()

    constructor() {
        _nodes = mutableMapOf()
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

    constructor(nodes: Map<String, Node>) {
        this._nodes = nodes.toMutableMap()
    }

    fun copy(nodes: Map<String, Node>): Tree {
        return Tree(nodes)
    }

    fun getRootNode(): CircleNode {
        _nodes[ROOT_ID]
            ?: throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_ROOT_NODE_NOT_EXIST.message)
        return _nodes[ROOT_ID] as CircleNode
    }

    fun setRootNode(root: CircleNode) {
        _nodes[ROOT_ID] = root
    }

    fun setNode(
        id: String,
        node: Node,
    ) {
        _nodes[id] = node
    }

    fun getNode(id: String): Node {
        return _nodes[id]
            ?: throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_INVALID_NODE_ID.message)
    }

    fun addNode(
        targetId: String,
        parentId: String?,
        content: String,
    ) {
        if (_nodes[targetId] != null) throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_DUPLICATED_NODE.message)
        if (parentId == null) throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_PARENT_NODE_NOT_EXIST.message)
        val newNode =
            NodeGenerator.makeNode(content, parentId).copy(id = targetId, parentId = parentId)
        val parentNode =
            _nodes[parentId] ?: throw IllegalArgumentException(
                ExceptionMessage.ERROR_MESSAGE_PARENT_NODE_NOT_EXIST.message,
            )
        val newChildren = parentNode.children.toMutableList()
        newChildren.add(targetId)
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
        newNodes.add(targetId)
        val newParentNode =
            when (parentNode) {
                is CircleNode -> parentNode.copy(children = newNodes)
                is RectangleNode -> parentNode.copy(children = newNodes)
            }

        _nodes[targetId] = newTargetNode
        _nodes[parentId] = newParentNode
    }

    fun removeNode(targetId: String) {
        if (targetId == ROOT_ID) throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_ROOT_CANT_REMOVE.message)
        val targetNode =
            _nodes[targetId]
                ?: throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_TARGET_NODE_NOT_EXIST.message)
        targetNode.parentId?.let { parentId ->
            val parentNode =
                _nodes[parentId] ?: throw IllegalArgumentException(
                    ExceptionMessage.ERROR_MESSAGE_PARENT_NODE_NOT_EXIST.message,
                )
            val newChildren = parentNode.children.filter { id -> id != targetId }
            val newParent =
                when (parentNode) {
                    is CircleNode -> parentNode.copy(children = newChildren)

                    is RectangleNode -> parentNode.copy(children = newChildren)
                }
            _nodes[parentId] = newParent
        } ?: throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_ROOT_CANT_REMOVE.message)
    }

    fun updateNode(
        targetId: String,
        description: String,
        children: List<String> = emptyList(),
        dx: Dp = Dp(0f),
        dy: Dp = Dp(0f),
    ) {
        val targetNode =
            _nodes[targetId]
                ?: throw IllegalArgumentException(ExceptionMessage.ERROR_MESSAGE_TARGET_NODE_NOT_EXIST.message)
        val newTargetNode =
            when (targetNode) {
                is CircleNode -> targetNode.copy(description = description)
                is RectangleNode ->
                    targetNode.copy(
                        path =
                            targetNode.path.copy(
                                centerX = dx,
                                centerY = dy,
                            ),
                        description = description,
                        children = if (children.isEmpty()) targetNode.children else children,
                    )
            }
        _nodes[targetId] = newTargetNode
    }

    fun doPreorderTraversal(
        node: Node = getRootNode(),
        action: (node: Node) -> Unit,
    ) {
        action.invoke(node)
        node.children.forEach { childId ->
            doPreorderTraversal(getNode(childId), action)
        }
    }

    fun doPreorderTraversal(
        node: Node = getRootNode(),
        depth: Int = 0,
        action: (node: Node, depth: Int) -> Unit,
    ) {
        action.invoke(node, depth)
        node.children.forEach { childId ->
            doPreorderTraversal(getNode(childId), depth + 1, action)
        }
    }

    companion object {
        private const val ROOT_ID = "root"
    }
}
