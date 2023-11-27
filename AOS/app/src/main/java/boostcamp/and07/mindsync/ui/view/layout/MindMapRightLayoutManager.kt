package boostcamp.and07.mindsync.ui.view.layout

import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp

class MindMapRightLayoutManager {
    private val horizontalSpacing = Dp(50f)
    private val verticalSpacing = Dp(50f)

    fun arrangeNode(head: CircleNode): Node {
        val totalHeight = measureChildHeight(head)
        var newHead = head
        if (head.path.centerX.dpVal <= (totalHeight / 2).dpVal) {
            val newPath =
                head.path.copy(
                    centerY = totalHeight / 2 + horizontalSpacing,
                )
            newHead = newHead.copy(path = newPath)
        }
        return recurArrangeNode(newHead)
    }

    private fun recurArrangeNode(node: Node): Node {
        val childHeightSum = measureChildHeight(node)
        val newNodes = mutableListOf<RectangleNode>()

        val nodeWidth =
            when (node) {
                is RectangleNode -> node.path.width
                is CircleNode -> node.path.radius
            }

        val criteriaX = node.path.centerX + nodeWidth / 2 + horizontalSpacing
        var startX: Dp
        var startY = node.path.centerY - (childHeightSum / 2)

        node.children.forEach { childNode ->
            startX = criteriaX + (childNode.path.width / 2)

            val childHeight = measureChildHeight(childNode)
            val newY = startY + (childHeight / 2)
            val newPath = childNode.path.copy(centerX = startX, centerY = newY)

            newNodes.add(
                childNode.copy(path = newPath),
            )

            startY += childHeight + verticalSpacing
        }

        newNodes.forEachIndexed { index, childNode ->
            newNodes[index] = recurArrangeNode(childNode) as RectangleNode
        }
        val newNode =
            when (node) {
                is RectangleNode -> node.copy(children = newNodes)
                is CircleNode -> {
                    node.copy(
                        children = newNodes,
                    )
                }
            }

        return newNode
    }

    fun measureChildHeight(node: Node): Dp {
        var heightSum = Dp(0f)

        if (node.children.isNotEmpty()) {
            node.children.forEach { childNode ->
                heightSum += measureChildHeight(childNode)
            }
            heightSum += verticalSpacing * (node.children.size - 1)
        } else {
            heightSum =
                when (node) {
                    is CircleNode -> node.path.radius
                    is RectangleNode -> node.path.height
                }
        }

        return heightSum
    }
}
