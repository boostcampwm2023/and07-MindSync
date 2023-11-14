package boostcamp.and07.mindsync.data.model

data class Node(
    val path: NodePath,
    val color: ColorRGB,
    val description: String,
    val nodes: List<Node>,
)
