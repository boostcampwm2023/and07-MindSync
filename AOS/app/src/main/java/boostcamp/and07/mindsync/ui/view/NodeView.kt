package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Rect
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.util.toPx
import boostcamp.and07.mindsync.ui.view.model.DrawInfo

class NodeView(
    val mindMapContainer: MindMapContainer,
    context: Context,
    attrs: AttributeSet?,
) : View(context, attrs) {
    lateinit var tree: Tree
    private val drawInfo = DrawInfo(context)
    private val nodeColors =
        listOf(
            context.getColor(R.color.main3),
            context.getColor(R.color.mindmap2),
            context.getColor(R.color.mindmap3),
            context.getColor(R.color.mindmap4),
            context.getColor(R.color.mindmap5),
        )

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawTree(canvas)
        mindMapContainer.selectNode?.let { selectedNode ->
            makeStrokeNode(canvas, selectedNode)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                findTouchNode(event.x, event.y)
            }
        }
        return super.onTouchEvent(event)
    }

    fun updateTree(tree: Tree) {
        this.tree = tree
        invalidate()
    }

    private fun drawTree(canvas: Canvas) {
        tree.doPreorderTraversal { node, depth ->
            mindMapContainer.selectNode?.let { selectedNode ->
                if (selectedNode.id == node.id) {
                    mindMapContainer.setSelectedNode(node)
                }
            }
            drawNode(canvas, node, depth)
        }
    }

    private fun findTouchNode(
        x: Float,
        y: Float,
    ) {
        var rangeResultNode: Node? = null
        tree.doPreorderTraversal { node ->
            if (isInsideNode(node, x, y)) {
                rangeResultNode = node
            }
        }
        rangeResultNode?.let {
            mindMapContainer.setSelectedNode(it)
        } ?: run {
            mindMapContainer.setSelectedNode(null)
        }
        invalidate()
    }

    private fun makeStrokeNode(
        canvas: Canvas,
        node: Node,
    ) {
        when (node) {
            is CircleNode -> {
                canvas.drawCircle(
                    node.path.centerX.toPx(context),
                    node.path.centerY.toPx(context),
                    node.path.radius.toPx(context),
                    drawInfo.strokePaint,
                )
            }

            is RectangleNode -> {
                canvas.drawRect(
                    node.path.leftX().toPx(context),
                    node.path.topY().toPx(context),
                    node.path.rightX().toPx(context),
                    node.path.bottomY().toPx(context),
                    drawInfo.strokePaint,
                )
            }
        }
    }

    private fun isInsideNode(
        node: Node,
        x: Float,
        y: Float,
    ): Boolean {
        when (node) {
            is CircleNode -> {
                if (x in (node.path.centerX - node.path.radius).toPx(context)..(node.path.centerX + node.path.radius).toPx(context) &&
                    y in (node.path.centerY - node.path.radius).toPx(context)..(node.path.centerY + node.path.radius).toPx(context)
                ) {
                    return true
                }
            }

            is RectangleNode -> {
                if (x in node.path.leftX().toPx(context)..node.path.rightX().toPx(context) &&
                    y in node.path.topY().toPx(context)..node.path.bottomY().toPx(context)
                ) {
                    return true
                }
            }
        }
        return false
    }

    private fun drawNode(
        canvas: Canvas,
        node: Node,
        depth: Int,
    ) {
        when (node) {
            is CircleNode -> drawCircleNode(canvas, node)
            is RectangleNode -> drawRectangleNode(canvas, node, depth)
        }
        drawText(canvas, node)
    }

    private fun drawCircleNode(
        canvas: Canvas,
        node: CircleNode,
    ) {
        canvas.drawCircle(
            node.path.centerX.toPx(context),
            node.path.centerY.toPx(context),
            node.path.radius.toPx(context),
            drawInfo.circlePaint,
        )
    }

    private fun drawRectangleNode(
        canvas: Canvas,
        node: RectangleNode,
        depth: Int,
    ) {
        drawInfo.rectanglePaint.color = nodeColors[(depth - 1) % nodeColors.size]
        canvas.drawRect(
            node.path.leftX().toPx(context),
            node.path.topY().toPx(context),
            node.path.rightX().toPx(context),
            node.path.bottomY().toPx(context),
            drawInfo.rectanglePaint,
        )
    }

    private fun drawText(
        canvas: Canvas,
        node: Node,
    ) {
        val lines = node.description.split("\n")
        val bounds = Rect()
        when (node) {
            is CircleNode -> {
                drawInfo.textPaint.color = Color.WHITE
                if (lines.size > 1) {
                    var y =
                        node.path.centerY.toPx(context) - node.path.radius.toPx(context) / 2 + drawInfo.padding.toPx(
                            context,
                        ) / 2
                    for (line in lines) {
                        drawInfo.textPaint.getTextBounds(line, 0, line.length, bounds)
                        canvas.drawText(
                            line,
                            node.path.centerX.toPx(context),
                            y + bounds.height(),
                            drawInfo.textPaint,
                        )
                        y += bounds.height() + drawInfo.lineHeight.dpVal
                    }
                } else {
                    canvas.drawText(
                        node.description,
                        node.path.centerX.toPx(context),
                        node.path.centerY.toPx(context) + drawInfo.lineHeight.dpVal / 2,
                        drawInfo.textPaint,
                    )
                }
            }

            is RectangleNode -> {
                drawInfo.textPaint.color = Color.BLACK
                if (lines.size > 1) {
                    var y =
                        node.path.centerY.toPx(context) - node.path.height.toPx(context) / 2 + drawInfo.padding.toPx(
                            context,
                        ) / 2
                    for (line in lines) {
                        drawInfo.textPaint.getTextBounds(line, 0, line.length, bounds)
                        canvas.drawText(
                            line,
                            node.path.centerX.toPx(context),
                            y + bounds.height(),
                            drawInfo.textPaint,
                        )
                        y += bounds.height() + drawInfo.lineHeight.dpVal
                    }
                } else {
                    canvas.drawText(
                        node.description,
                        node.path.centerX.toPx(context),
                        node.path.centerY.toPx(context) + drawInfo.lineHeight.dpVal / 2,
                        drawInfo.textPaint,
                    )
                }
            }
        }
    }
}
