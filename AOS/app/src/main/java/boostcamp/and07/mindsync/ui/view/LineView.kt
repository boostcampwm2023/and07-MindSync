package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.util.Log
import android.view.View
import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.NodePath
import boostcamp.and07.mindsync.data.model.RectanglePath
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class LineView constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {
    private val paint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = Dp(5f).toPx(context).toFloat()
        isAntiAlias = true
    }
    private val path = Path()
    private val head = SampleNode.head

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (head.nodes.isNotEmpty()) {
            traverseLine(canvas, head, 1)
        }
    }

    private fun traverseLine(canvas: Canvas, node: Node, depth: Int) {
        for (toNode in node.nodes) {
            Log.d("Line", "${node.description} ${toNode.description}")
            drawLine(node, toNode, canvas)
            traverseLine(canvas, toNode, depth + 1)
        }
    }

    private fun drawLine(fromNode: Node, toNode: Node, canvas: Canvas) {
        val fromCenterX = calculateCenterX(fromNode.path)
        val fromCenterY = calculateCenterY(fromNode.path)
        val toCenterX = calculateCenterX(toNode.path)
        val toCenterY = calculateCenterY(toNode.path)
        val path = path.apply {
            reset()
            moveTo(fromCenterX, fromCenterY)
            lineTo(toCenterX, toCenterY)
        }
        canvas.drawPath(path, paint)
    }

    private fun calculateCenterX(path: NodePath): Float {
        return when (path) {
            is RectanglePath -> ((path.endX + path.startX) / Dp(2f)).toPx(context).toFloat()
            is CirclePath -> path.centerX.toPx(context).toFloat()
        }
    }

    private fun calculateCenterY(path: NodePath): Float {
        return when (path) {
            is RectanglePath -> ((path.bottomY + path.topY) / Dp(2f)).toPx(context).toFloat()
            is CirclePath -> path.centerY.toPx(context).toFloat()
        }
    }
}
