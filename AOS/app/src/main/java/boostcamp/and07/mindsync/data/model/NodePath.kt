package boostcamp.and07.mindsync.data.model

sealed class NodePath

data class RectanglePath(
    val startX: Float,
    val endX: Float,
    val topY: Float,
    val bottomY: Float,
) : NodePath()

data class CirclePath(
    val centerX: Float,
    val centerY: Float,
    val radius: Float,
) : NodePath()
