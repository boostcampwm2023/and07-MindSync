package boostcamp.and07.mindsync.ui.view.layout

import android.content.Context
import android.graphics.Rect
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.Px
import boostcamp.and07.mindsync.ui.util.toDp
import boostcamp.and07.mindsync.ui.view.model.DrawInfo

class MeasureTextSize(private val context: Context) {
    private val drawInfo = DrawInfo(context)

    fun traverseTextHead(tree: Tree) {
        tree.doPreorderTraversal { node ->
            val newNode =
                changeSize(node, sumWidth(node.description), sumTotalHeight(node.description))
            tree.setNode(node.id, newNode)
        }
    }

    private fun changeSize(
        node: Node,
        width: Float,
        height: Float,
    ): Node {
        when (node) {
            is CircleNode -> {
                val newRadius =
                    Dp(
                        maxOf(
                            (Dp(Px(width).toDp(context) / 2) + drawInfo.padding).dpVal,
                            ((Dp(Px(height).toDp(context)) + drawInfo.padding * 2) / 2).dpVal,
                        ),
                    )
                return node.copy(
                    id = node.id,
                    parentId = node.parentId,
                    path = node.path.copy(radius = newRadius),
                    description = node.description,
                    children = node.children,
                )
            }

            is RectangleNode -> {
                var newWidth = Dp(Px(width).toDp(context)) + drawInfo.padding
                val newHeight = Dp(Px(height).toDp(context)) + drawInfo.padding
                return node.copy(
                    id = node.id,
                    parentId = node.parentId,
                    path = node.path.copy(width = newWidth, height = newHeight),
                    description = node.description,
                    children = node.children,
                )
            }
        }
    }

    private fun sumTotalHeight(description: String): Float {
        val bounds = Rect()
        var sum = 0f
        description.split("\n").forEach { line ->
            drawInfo.textPaint.getTextBounds(line, 0, line.length, bounds)
            sum += bounds.height() + drawInfo.lineHeight.dpVal
        }
        return sum
    }

    private fun sumWidth(description: String): Float {
        var sum = 0f
        description.split("\n").forEach {
            sum = maxOf(sum, drawInfo.textPaint.measureText(it))
        }
        return sum
    }
}
