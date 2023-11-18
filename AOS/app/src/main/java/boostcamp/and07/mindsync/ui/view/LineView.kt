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
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class LineView constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {
    private val paint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = Dp(5f).toPx(context)
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
            drawLine(node, toNode, canvas)
            traverseLine(canvas, toNode, depth + 1)
        }
    }

    private fun drawLine(fromNode: Node, toNode: Node, canvas: Canvas) {
        val path = path.apply {
            reset()
            moveTo(
                fromNode.path.centerX.toPx(context),
                fromNode.path.centerY.toPx(context),
            )
            lineTo(
                toNode.path.centerX.toPx(context),
                toNode.path.centerY.toPx(context),
            )
        }
        canvas.drawPath(path, paint)
    }
}
