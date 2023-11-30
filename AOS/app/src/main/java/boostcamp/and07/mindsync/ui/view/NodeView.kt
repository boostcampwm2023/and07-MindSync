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
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.Px
import boostcamp.and07.mindsync.ui.util.toDp
import boostcamp.and07.mindsync.ui.util.toPx
import boostcamp.and07.mindsync.ui.view.layout.MindMapRightLayoutManager
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
    private var attachedNode: Node? = null
    private val rightLayoutManager = MindMapRightLayoutManager()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        drawAttachedNodeNode(canvas)
        drawTree(canvas)
        mindMapContainer.selectNode?.let { selectedNode ->
            makeStrokeNode(canvas, selectedNode)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                mindMapContainer.isMoving = false
                findTouchNode(event.x, event.y)
                return mindMapContainer.selectNode != null
            }

            MotionEvent.ACTION_MOVE -> {
                mindMapContainer.isMoving = true
                moveNode(
                    event.x,
                    event.y,
                )
                findIncludedNode(event.x, event.y)
                return true
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (mindMapContainer.isMoving) {
                    mindMapContainer.isMoving = false
                    mindMapContainer.selectNode?.let { selectedNode ->
                        findIncludedNode(event.x, event.y)
                        attachNode(selectedNode)
                        attachedNode?.let { attachedNode ->
                            mindMapContainer.update(tree, selectedNode, attachedNode)
                        }
                    }
                }
                attachedNode = null
                invalidate()
            }
        }
        return false
    }

    private fun attachNode(selectedNode: Node) {
        attachedNode?.let { attachedNode ->
            tree.doPreorderTraversal { node ->
                if (node.id == selectedNode.id) {
                    tree.removeNode(node.id)
                }
            }
            tree.doPreorderTraversal { node ->
                if (node.id == attachedNode.id) {
                    tree.attachNode(selectedNode.id, attachedNode.id)
                }
            }
        }
        rightLayoutManager.arrangeNode(tree)
    }

    private fun findIncludedNode(
        dx: Float,
        dy: Float,
    ) {
        var attachedNode: Node? = null
        mindMapContainer.tree.doPreorderTraversal { node ->
            mindMapContainer.selectNode?.let {
                if (isInsideNode(node, dx, dy) && mindMapContainer.selectNode?.id != node.id) {
                    attachedNode = node
                }
            }
        }

        attachedNode?.let { node ->
            this.attachedNode = node
        } ?: run {
            this.attachedNode = null
        }
    }

    private fun moveNode(
        dx: Float,
        dy: Float,
    ) {
        mindMapContainer.selectNode?.let { selectedNode ->
            if (selectedNode is CircleNode) return
            traverseMovedNode(tree.getRootNode(), selectedNode, dx, dy)
            mindMapContainer.update(tree)
        }
        invalidate()
    }

    private fun traverseMovedNode(
        node: Node,
        target: Node,
        dx: Float,
        dy: Float,
    ) {
        if (node.id == target.id) {
            val centerX = Dp(Px(dx).toDp(context))
            val centerY = Dp(Px(dy).toDp(context))
            tree.updateNode(target.id, target.description, target.children, centerX, centerY)
            return
        }

        node.children.forEach { nodeId ->
            traverseMovedNode(tree.getNode(nodeId), target, dx, dy)
        }
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

    private fun drawAttachedNodeNode(canvas: Canvas) {
        attachedNode?.let { attachedNode ->
            if (attachedNode is RectangleNode) {
                val height = attachedNode.path.height
                val width = attachedNode.path.width
                val radius = if (height.dpVal >= width.dpVal) height else width
                canvas.drawCircle(
                    attachedNode.path.centerX.toPx(context),
                    attachedNode.path.centerY.toPx(context),
                    radius.toPx(context),
                    drawInfo.boundaryPaint,
                )
            }
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
