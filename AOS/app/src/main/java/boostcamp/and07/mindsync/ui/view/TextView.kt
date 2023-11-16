package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class TextView constructor(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private val tag = "TextView"
    private val head = SampleNode.head
    private lateinit var selectNode: Node
    private var select = false
    private val textPaint = Paint().apply {
        color = Color.RED
        textSize = Dp(12f).toPx(context).toFloat()
    }
    private val textBoxPaint = Paint().apply {
        color = Color.BLUE
        strokeWidth = 5f
        style = Paint.Style.STROKE
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        traverseHead(canvas)
        if (select) {
            drawTextBox(canvas, selectNode)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                val clickTime = System.currentTimeMillis()
            }
        }
        traverseHead(event.x, event.y)
        return super.onTouchEvent(event)
    }

    private fun traverseHead(canvas: Canvas) {
        traverseNode(canvas, head, 0)
    }

    private fun traverseHead(x: Float, y: Float) {
        val node = dfs(head, x, y)
        node?.let {
            selectNode = node
            select = true
            invalidate()
        } ?: run {
            select = false
        }
    }

    private fun dfs(node: Node, x: Float, y: Float): Node? {
        if (checkRange(node, x, y)) {
            return node
        }
        if (node.nodes.isNotEmpty()) {
            for (child in node.nodes) {
                return dfs(child, x, y) ?: continue
            }
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

    private fun traverseNode(canvas: Canvas, node: Node, depth: Int) {
        drawText(canvas, node, depth)
        if (node.nodes.isNotEmpty()) {
            node.nodes.forEach { node ->
                traverseNode(canvas, node, depth + 1)
            }
        }
    }

    private fun drawText(canvas: Canvas, node: Node, depth: Int) {
        val width = textPaint.measureText(node.description).toInt()
        val height = textPaint.descent().toInt() - textPaint.ascent().toInt()
        when (node) {
            is CircleNode -> {
                canvas.drawText(
                    node.description,
                    node.path.centerX.toPx(context).toFloat() - (width / 2).toFloat(),
                    node.path.centerY.toPx(context).toFloat() + (height / 2).toFloat(),
                    textPaint,
                )
            }

            is RectangleNode -> {
                canvas.drawText(
                    node.description,
                    node.path.centerX.toPx(context).toFloat() - (width / 2).toFloat(),
                    node.path.centerY.toPx(context).toFloat() + (height / 2).toFloat(),
                    textPaint,
                )
            }
        }
    }

    private fun drawTextBox(canvas: Canvas, node: Node) {
        val width = textPaint.measureText(node.description).toInt()
        val height = textPaint.descent().toInt() - textPaint.ascent().toInt()
        canvas.drawRect(
            node.path.centerX.toPx(context).toFloat() - (width / 2).toFloat(),
            node.path.centerY.toPx(context).toFloat() + (height / 2).toFloat(),
            node.path.centerX.toPx(context) + (width / 2).toFloat(),
            node.path.centerY.toPx(context).toFloat() - (height / 2).toFloat(),
            textBoxPaint,
        )
    }
}
