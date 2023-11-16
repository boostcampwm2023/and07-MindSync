package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import androidx.core.content.res.ResourcesCompat
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class NodeView constructor(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private val head = SampleNode.head
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
    private val textPaint = Paint().apply {
        color = Color.RED
        textSize = Dp(12f).toPx(context).toFloat()
        typeface = ResourcesCompat.getFont(context, R.font.pretendard_bold)
    }
    private var listener: NodeClickListener? = null

    private var lastClickTime = 0L
    fun setTextViewClickListener(listener: NodeClickListener) {
        this.listener = listener
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        traverseDrawHead(canvas)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                val clickTime = System.currentTimeMillis()
                if (clickTime - lastClickTime < DOUBLE_CLICK_TIME) {
                    traverseRangeHead(event.x, event.y)
                } else {
                    lastClickTime = clickTime
                    invalidate()
                }
            }
        }
        return super.onTouchEvent(event)
    }

    private fun traverseDrawHead(canvas: Canvas) {
        traverseDrawNode(canvas, head, 0)
    }

    private fun traverseDrawNode(canvas: Canvas, node: Node, depth: Int) {
        drawNode(canvas, node, depth)
        node.nodes.forEach { node ->
            traverseDrawNode(canvas, node, depth + 1)
        }
    }

    private fun traverseRangeHead(x: Float, y: Float) {
        val node = traverseRangeNode(head, x, y)
        node?.let {
            listener?.onDoubleClicked(node)
        }
    }

    private fun traverseRangeNode(node: Node, x: Float, y: Float): Node? {
        if (checkRange(node, x, y)) {
            return node
        }
        for (child in node.nodes) {
            return traverseRangeNode(child, x, y) ?: continue
        }
        return null
    }

    private fun checkRange(node: Node, x: Float, y: Float): Boolean {
        when (node) {
            is CircleNode -> {
                if (x in (node.path.centerX - node.path.radius).toPx(context)
                        .toFloat()..(node.path.centerX + node.path.radius).toPx(context)
                        .toFloat() &&
                    y in (node.path.centerY - node.path.radius).toPx(context)
                        .toFloat()..(node.path.centerY + node.path.radius).toPx(context).toFloat()
                ) {
                    return true
                }
            }

            is RectangleNode -> {
                if (x in node.path.leftX().toPx(context).toFloat()..node.path.rightX().toPx(context)
                        .toFloat() &&
                    y in node.path.topY().toPx(context).toFloat()..node.path.bottomY()
                        .toPx(context).toFloat()
                ) {
                    return true
                }
            }
        }
        return false
    }

    private fun drawNode(canvas: Canvas, node: Node, depth: Int) {
        when (node) {
            is CircleNode -> drawCircleNode(canvas, node)
            is RectangleNode -> drawRectangleNode(canvas, node, depth)
        }
        drawText(canvas, node)
    }

    private fun drawCircleNode(canvas: Canvas, node: CircleNode) {
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

    private fun drawText(canvas: Canvas, node: Node) {
        val width = textPaint.measureText(node.description).toInt()
        val height = textPaint.descent().toInt() - textPaint.ascent().toInt()
        when (node) {
            is CircleNode -> {
                textPaint.color = Color.WHITE
                canvas.drawText(
                    node.description,
                    node.path.centerX.toPx(context).toFloat() - (width / 2).toFloat(),
                    node.path.centerY.toPx(context).toFloat() + (height / 2).toFloat(),
                    textPaint,
                )
            }

            is RectangleNode -> {
                textPaint.color = Color.BLACK
                canvas.drawText(
                    node.description,
                    node.path.centerX.toPx(context).toFloat() - (width / 2).toFloat(),
                    node.path.centerY.toPx(context).toFloat() + (height / 2).toFloat(),
                    textPaint,
                )
            }
        }
    }

    companion object {
        const val DOUBLE_CLICK_TIME = 200
    }
}
