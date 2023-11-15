package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.util.Log
import android.view.View
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.toPx

class NodeView constructor(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private val head = SampleNode.head
    private val circlePaint = Paint().apply {
        color = context.getColor(R.color.sub1)
    }
    private val rectanglePaint = Paint()
    private val nodeColors = listOf(
        context.getColor(R.color.main2),
        context.getColor(R.color.main4),
        context.getColor(R.color.main1),
        context.getColor(R.color.main3),
        context.getColor(R.color.sub2),
        context.getColor(R.color.sub1),
    )

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        traverseHead(canvas)
    }

    private fun traverseHead(canvas: Canvas) {
        traverseNode(canvas, head, 0)
    }

    private fun traverseNode(canvas: Canvas, node: Node, depth: Int) {
        drawNode(canvas, node, depth)
        if (node.nodes.isNotEmpty()) {
            node.nodes.forEach { node ->
                traverseNode(canvas, node, depth + 1)
            }
        }
    }

    private fun drawNode(canvas: Canvas, node: Node, depth: Int) {
        when (node) {
            is CircleNode -> drawCircleNode(canvas, node, depth)
            is RectangleNode -> drawRectangleNode(canvas, node, depth)
        }
    }

    private fun drawCircleNode(canvas: Canvas, node: CircleNode, depth: Int) {
        canvas.drawCircle(
            node.path.centerX.toPx(context).toFloat(),
            node.path.centerY.toPx(context).toFloat(),
            node.path.radius.toPx(context).toFloat(),
            circlePaint,
        )
    }

    private fun drawRectangleNode(canvas: Canvas, node: RectangleNode, depth: Int) {
        rectanglePaint.color = nodeColors[(depth - 1) % nodeColors.size]
        canvas.drawRect(
            node.path.leftX().toPx(context).toFloat(),
            node.path.topY().toPx(context).toFloat(),
            node.path.rightX().toPx(context).toFloat(),
            node.path.bottomY().toPx(context).toFloat(),
            rectanglePaint,
        )
    }
}
