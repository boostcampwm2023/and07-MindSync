package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.toPx
import boostcamp.and07.mindsync.ui.view.layout.MindmapRightLayoutManager

class NodeView constructor(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private var head = SampleNode.head
    private val circlePaint = Paint().apply {
        color = context.getColor(R.color.mindmap1)
    }
    private val rectanglePaint = Paint()
    private val nodeColors = listOf(
        context.getColor(R.color.main3),
        context.getColor(R.color.mindmap2),
        context.getColor(R.color.mindmap3),
        context.getColor(R.color.mindmap4),
        context.getColor(R.color.mindmap5),
    )
    private val rightLayoutManager = MindmapRightLayoutManager()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        arrangement()
        traverseHead(canvas)
    }

    override fun invalidate() {
        arrangement()
        super.invalidate()
    }

    private fun arrangement() {
        head = rightLayoutManager.arrangement(head)
    }

    private fun traverseHead(canvas: Canvas) {
        traverseNode(canvas, head, 0)
    }

    private fun traverseNode(canvas: Canvas, node: Node, depth: Int) {
        drawNode(canvas, node, depth)
        node.nodes.forEach { node ->
            traverseNode(canvas, node, depth + 1)
        }
    }

    private fun drawNode(canvas: Canvas, node: Node, depth: Int) {
        when (node) {
            is CircleNode -> drawCircleNode(canvas, node)
            is RectangleNode -> drawRectangleNode(canvas, node, depth)
        }
    }

    private fun drawCircleNode(canvas: Canvas, node: CircleNode) {
        canvas.drawCircle(
            node.path.centerX.toPx(context),
            node.path.centerY.toPx(context),
            node.path.radius.toPx(context),
            circlePaint,
        )
    }

    private fun drawRectangleNode(canvas: Canvas, node: RectangleNode, depth: Int) {
        rectanglePaint.color = nodeColors[(depth - 1) % nodeColors.size]
        canvas.drawRect(
            node.path.leftX().toPx(context),
            node.path.topY().toPx(context),
            node.path.rightX().toPx(context),
            node.path.bottomY().toPx(context),
            rectanglePaint,
        )
    }
}
