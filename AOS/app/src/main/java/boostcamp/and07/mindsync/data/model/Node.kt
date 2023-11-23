package boostcamp.and07.mindsync.data.model

sealed class Node(
    open val id: String,
    open val path: NodePath,
    open val description: String,
    open val nodes: List<RectangleNode>,
)

data class CircleNode(
    override val id: String,
    override val path: CirclePath,
    override val description: String,
    override val nodes: List<RectangleNode>,
) : Node(id, path, description, nodes)

data class RectangleNode(
    override val id: String,
    override val path: RectanglePath,
    override val description: String,
    override val nodes: List<RectangleNode>,
) : Node(id, path, description, nodes)
