package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.text.TextPaint
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
import boostcamp.and07.mindsync.ui.util.Px
import boostcamp.and07.mindsync.ui.util.toDp
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
    private val textPaint = TextPaint().apply {
        color = Color.RED
        textSize = Dp(12f).toPx(context)
        isAntiAlias = true
        typeface = ResourcesCompat.getFont(context, R.font.pretendard_bold)
        textAlign = Paint.Align.CENTER
    }

    private val strokePaint = Paint().apply {
        color = context.getColor(R.color.blue)
        style = Paint.Style.STROKE
        strokeWidth = Dp(5f).toPx(context)
        isAntiAlias = true
    }

    private val lineHeight = Dp(15f)
    private var touchedNode: Node? = null

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        traverseTextHead()
        arrangeNode()
        traverseDrawHead(canvas)
        touchedNode?.let { touchNode ->
            makeStrokeNode(canvas, touchNode)
        }
    }

    private fun arrangeNode() {
        head = rightLayoutManager.arrangeNode(head)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                traverseRangeHead(event.x, event.y)
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

    private fun traverseTextHead() {
        head = traverseTextNode(head)
    }

    private fun traverseTextNode(node: Node): Node {
        val newNodes = mutableListOf<RectangleNode>()
        node.nodes.forEach { child ->
            newNodes.add(traverseTextNode(child) as RectangleNode)
            traverseTextNode(child)
        }
        val copyNode =
            changeSize(node, sumWidth(node.description), sumTotalHeight(node.description))
        val newNode = when (copyNode) {
            is CircleNode -> copyNode.copy(nodes = newNodes)
            is RectangleNode -> copyNode.copy(nodes = newNodes)
        }
        return newNode
    }

    private fun changeSize(node: Node, width: Px, height: Float): Node {
        when (node) {
            is CircleNode -> {
                var newRadius = node.path.radius
                if (width.toDp(context) > node.path.radius.dpVal && !node.description.contains("\n")
                ) {
                    newRadius = Dp(width.toDp(context) / 2) + lineHeight / 2
                }
                if (node.description.contains("\n")) {
                    newRadius = (Dp(height) - lineHeight) / 2
                }
                return node.copy(node.path.copy(radius = newRadius))
            }

            is RectangleNode -> {
                var newWidth = node.path.width
                if (width.toDp(context) > node.path.width.dpVal && !node.description.contains("\n")
                ) {
                    newWidth = Dp(width.toDp(context)) + lineHeight
                }
                val newHeight = Dp(height) / 2 + lineHeight
                return node.copy(node.path.copy(width = newWidth, height = newHeight))
            }
        }
    }

    private fun traverseRangeHead(x: Float, y: Float) {
        val rangeResult = traverseRangeNode(head, x, y, 0)

        rangeResult?.let {
            touchedNode = it.first
        } ?: run {
            touchedNode = null
        }
        invalidate()
    }

    private fun makeStrokeNode(canvas: Canvas, node: Node) {
        when (node) {
            is CircleNode -> {
                canvas.drawCircle(
                    node.path.centerX.toPx(context),
                    node.path.centerY.toPx(context),
                    node.path.radius.toPx(context),
                    strokePaint,
                )
            }

            is RectangleNode -> {
                canvas.drawRect(
                    node.path.leftX().toPx(context),
                    node.path.topY().toPx(context),
                    node.path.rightX().toPx(context),
                    node.path.bottomY().toPx(context),
                    strokePaint,
                )
            }
        }
    }

    private fun traverseRangeNode(node: Node, x: Float, y: Float, depth: Int): Pair<Node, Int>? {
        if (isInsideNode(node, x, y)) {
            return Pair(node, depth)
        }
        for (child in node.nodes) {
            return traverseRangeNode(child, x, y, depth + 1) ?: continue
        }
        return null
    }

    private fun isInsideNode(node: Node, x: Float, y: Float): Boolean {
        when (node) {
            is CircleNode -> {
                if (x in (node.path.centerX - node.path.radius).toPx(context)..(node.path.centerX + node.path.radius).toPx(
                        context,
                    ) &&
                    y in (node.path.centerY - node.path.radius).toPx(context)..(node.path.centerY + node.path.radius).toPx(
                        context,
                    )
                ) {
                    return true
                }
            }

            is RectangleNode -> {
                if (x in node.path.leftX().toPx(context)..node.path.rightX().toPx(context) &&
                    y in node.path.topY().toPx(context)..node.path.bottomY()
                        .toPx(context)
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

    private fun sumTotalHeight(description: String): Float {
        val bounds = Rect()
        var sum = 0f
        description.split("\n").forEach { line ->
            textPaint.getTextBounds(line, 0, line.length, bounds)
            sum += bounds.height() + lineHeight.dpVal
        }
        return sum
    }

    private fun sumWidth(description: String) = Px(textPaint.measureText(description))
    private fun drawText(canvas: Canvas, node: Node) {
        val lines = node.description.split("\n")
        var bounds = Rect()
        var totalHeight = sumTotalHeight(node.description)
        when (node) {
            is CircleNode -> {
                textPaint.color = Color.WHITE
                if (lines.size > 1) {
                    var y = node.path.centerY.toPx(context) - totalHeight / 2
                    for (line in lines) {
                        textPaint.getTextBounds(line, 0, line.length, bounds)
                        canvas.drawText(
                            line,
                            node.path.centerX.toPx(context),
                            y + bounds.height(),
                            textPaint,
                        )
                        y += bounds.height() + lineHeight.dpVal
                    }
                } else {
                    canvas.drawText(
                        node.description,
                        node.path.centerX.toPx(context),
                        node.path.centerY.toPx(context) + lineHeight.dpVal / 2,
                        textPaint,
                    )
                }
            }

            is RectangleNode -> {
                textPaint.color = Color.BLACK
                if (lines.size > 1) {
                    var y = node.path.centerY.toPx(context) - totalHeight / 2
                    for (line in lines) {
                        textPaint.getTextBounds(line, 0, line.length, bounds)
                        canvas.drawText(
                            line,
                            node.path.centerX.toPx(context),
                            y + bounds.height(),
                            textPaint,
                        )
                        y += bounds.height() + lineHeight.dpVal
                    }
                } else {
                    canvas.drawText(
                        node.description,
                        node.path.centerX.toPx(context),
                        node.path.centerY.toPx(context) + lineHeight.dpVal / 2,
                        textPaint,
                    )
                }
            }
        }
    }
}
