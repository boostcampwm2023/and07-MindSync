package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.ui.util.Dp

sealed class NodePath

data class RectanglePath(
    val startX: Dp,
    val endX: Dp,
    val topY: Dp,
    val bottomY: Dp,
) : NodePath()

data class CirclePath(
    val centerX: Dp,
    val centerY: Dp,
    val radius: Dp,
) : NodePath()
