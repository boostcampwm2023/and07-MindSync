package boostcamp.and07.mindsync.data.model

import boostcamp.and07.mindsync.ui.util.Dp

sealed class NodePath(open val centerX: Dp, open val centerY: Dp)

data class RectanglePath(
    override val centerX: Dp,
    override val centerY: Dp,
    val width: Dp,
    val height: Dp,
) : NodePath(centerX, centerY) {
    fun leftX() = centerX - (width / (Dp(2f)))
    fun topY() = centerY - (height / (Dp(2f)))
    fun rightX() = centerX + (width / (Dp(2f)))
    fun bottomY() = centerY + (height / (Dp(2f)))
}

data class CirclePath(
    override val centerX: Dp,
    override val centerY: Dp,
    val radius: Dp,
) : NodePath(centerX, centerY)
