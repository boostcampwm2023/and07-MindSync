package boostcamp.and07.mindsync.data

import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.RectanglePath
import boostcamp.and07.mindsync.ui.util.Dp

object NodeGenerator {
    fun makeNode(
        description: String,
        parentId: String,
    ) = RectangleNode(
        id = IdGenerator.makeRandomNodeId(),
        parentId = parentId,
        path =
            RectanglePath(
                Dp(0f),
                Dp(0f),
                Dp(0f),
                Dp(0f),
            ),
        description = description,
        listOf(),
    )
}
