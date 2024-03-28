package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.content.res.Configuration
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.util.AttributeSet
import android.view.View
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.util.toPx
import boostcamp.and07.mindsync.ui.view.model.DrawInfo

class LineView constructor(
    private val mindMapContainer: MindMapContainer,
    context: Context,
    attrs: AttributeSet? = null,
) : View(context, attrs) {
    private val drawInfo = DrawInfo(context)
    private val path = Path()
    private lateinit var tree: Tree

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (tree.getRootNode().children.isNotEmpty()) {
            traverseLine(canvas, tree.getRootNode(), 0)
        }
    }

    fun updateTree(tree: Tree) {
        this.tree = tree
        invalidate()
    }

    fun traverseLine(
        canvas: Canvas,
        node: Node,
        depth: Int,
    ) {
        for (toNodeId in node.children) {
            val toNode = tree.getNode(toNodeId)
            drawLine(node, toNode, canvas)
            traverseLine(canvas, toNode, depth + 1)
        }
    }

    private fun drawLine(
        fromNode: Node,
        toNode: Node,
        canvas: Canvas,
    ) {
        val linePaint =
            when (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) {
                Configuration.UI_MODE_NIGHT_YES -> {
                    drawInfo.darkModeLinePaint
                }

                Configuration.UI_MODE_NIGHT_NO -> {
                    drawInfo.linePaint
                }

                else -> drawInfo.linePaint
            }

        val startX = getNodeEdgeX(fromNode, true)
        val startY = fromNode.path.centerY.toPx(context)
        val endX = getNodeEdgeX(toNode, false)
        val endY = toNode.path.centerY.toPx(context)
        val midX = (startX + endX) / 2
        val path =
            path.apply {
                reset()
                moveTo(startX, startY)
                cubicTo(midX, startY, midX, endY, endX, endY)
            }
        drawPathConditionally(toNode, canvas, path, linePaint)
    }

    private fun drawPathConditionally(
        toNode: Node,
        canvas: Canvas,
        path: Path,
        linePaint: Paint,
    ) {
        if (!mindMapContainer.isMoving || mindMapContainer.selectNode?.id != toNode.id) {
            canvas.drawPath(path, linePaint)
        }
    }

    private fun getNodeEdgeX(
        node: Node,
        isStart: Boolean,
    ): Float {
        val nodeCenterX = node.path.centerX.toPx(context)
        val widthOffset =
            when (node) {
                is CircleNode -> node.path.radius.toPx(context)
                is RectangleNode -> node.path.width.toPx(context) / 2
            }
        return if (isStart) nodeCenterX + widthOffset else nodeCenterX - widthOffset
    }
}
