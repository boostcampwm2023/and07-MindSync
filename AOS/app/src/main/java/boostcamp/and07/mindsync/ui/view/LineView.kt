package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class LineView constructor(
    val mindmapContainer: MindmapContainer,
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {
    private val paint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = Dp(5f).toPx(context)
        isAntiAlias = true
    }
    private val path = Path()
    private lateinit var head: Node
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (head.nodes.isNotEmpty()) {
            traverseLine(canvas, head, 0)
        }
    }

    fun updateHead(headNode: Node) {
        head = headNode
        invalidate()
    }

    fun traverseLine(canvas: Canvas, node: Node, depth: Int) {
        for (toNode in node.nodes) {
            drawLine(node, toNode, canvas)
            traverseLine(canvas, toNode, depth + 1)
        }
    }

    private fun drawLine(fromNode: Node, toNode: Node, canvas: Canvas) {
        val startX = getNodeEdgeX(fromNode, true)
        val startY = fromNode.path.centerY.toPx(context)
        val endX = getNodeEdgeX(toNode, false)
        val endY = toNode.path.centerY.toPx(context)
        val midX = (startX + endX) / 2

        val path = path.apply {
            reset()
            moveTo(startX, startY)
            cubicTo(midX, startY, midX, endY, endX, endY)
        }
        canvas.drawPath(path, paint)
    }

    private fun getNodeEdgeX(node: Node, isStart: Boolean): Float {
        val nodeCenterX = node.path.centerX.toPx(context)
        val widthOffset = when (node) {
            is CircleNode -> node.path.radius.toPx(context)
            is RectangleNode -> node.path.width.toPx(context) / 2
        }
        return if (isStart) nodeCenterX + widthOffset else nodeCenterX - widthOffset
    }
}
