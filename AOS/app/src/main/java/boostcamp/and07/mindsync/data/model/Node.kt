package boostcamp.and07.mindsync.data.model

sealed class Node(
    open val path: NodePath,
    open val description: String,
    open val nodes: List<Node>,
)

data class CircleNode(
    override val path: CirclePath,
    override val description: String,
    override val nodes: List<Node>,
) : Node(path, description, nodes)

data class RectangleNode(
    override val path: RectanglePath,
    override val description: String,
    override val nodes: List<Node>,
) : Node(path, description, nodes)
