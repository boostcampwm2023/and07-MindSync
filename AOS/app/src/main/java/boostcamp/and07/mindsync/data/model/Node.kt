package boostcamp.and07.mindsync.data.model

sealed class Node(
    open val id: String,
    open val parentId: String?,
    open val path: NodePath,
    open val description: String,
    open val children: List<String>,
)

data class CircleNode(
    override val id: String,
    override val parentId: String?,
    override val path: CirclePath,
    override val description: String,
    override val children: List<String>,
) : Node(id, parentId, path, description, children)

data class RectangleNode(
    override val id: String,
    override val parentId: String,
    override val path: RectanglePath,
    override val description: String,
    override val children: List<String>,
) : Node(id, parentId, path, description, children)
