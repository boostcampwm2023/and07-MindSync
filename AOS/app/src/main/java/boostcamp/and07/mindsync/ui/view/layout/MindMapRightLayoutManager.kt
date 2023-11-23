package boostcamp.and07.mindsync.ui.view.layout

import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.ui.util.Dp

class MindMapRightLayoutManager {
    private val horizontalSpacing = Dp(50f)
    private val verticalSpacing = Dp(50f)

    fun arrangeNode(node: Node): Node {
        val childHeightSum = measureChildHeight(node)
        val newNodes = mutableListOf<RectangleNode>()

        val nodeWidth =
            when (node) {
                is RectangleNode -> node.path.width
                is CircleNode -> node.path.radius
            }

        val criteriaX = node.path.centerX + nodeWidth + horizontalSpacing
        var startX: Dp
        val newCenterY =
            if (node.path.centerY.dpVal >= (childHeightSum / 2).dpVal) node.path.centerY else childHeightSum / 2
        var startY = newCenterY - (childHeightSum / 2)

        node.nodes.forEach { childNode ->
            startX = criteriaX + (childNode.path.width / 2)

            val childHeight = measureChildHeight(childNode)
            val newCenterY = startY + (childHeight / 2)
            val newPath = childNode.path.copy(centerX = startX, centerY = newCenterY)

            newNodes.add(
                childNode.copy(path = newPath),
            )

            startY += childHeight + verticalSpacing
        }

        newNodes.forEachIndexed { index, childNode ->
            newNodes[index] = arrangeNode(childNode) as RectangleNode
        }
        val newNode =
            when (node) {
                is RectangleNode -> node.copy(nodes = newNodes)
                is CircleNode -> {
                    node.copy(
                        path =
                            CirclePath(
                                centerX = node.path.centerX,
                                centerY = newCenterY,
                                radius = node.path.radius,
                            ),
                        nodes = newNodes,
                    )
                }
            }

        return newNode
    }

    fun measureChildHeight(node: Node): Dp {
        var heightSum = Dp(0f)

        if (node.nodes.isNotEmpty()) {
            node.nodes.forEach { childNode ->
                heightSum += measureChildHeight(childNode)
            }
            heightSum += verticalSpacing * (node.nodes.size - 1)
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
