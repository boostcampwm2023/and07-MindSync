package boostcamp.and07.mindsync.data

import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.RectanglePath
import boostcamp.and07.mindsync.ui.util.Dp

object SampleNode {
    val head: Node = CircleNode(
        CirclePath(
            Dp(100f),
            Dp(500f),
            Dp(50f),
        ),
        "Root",
        listOf(
            RectangleNode(
                RectanglePath(Dp(200f), Dp(100f), Dp(50f), Dp(50f)),
                "Child1",
                listOf(
                    RectangleNode(
                        RectanglePath(Dp(250f), Dp(200f), Dp(50f), Dp(50f)),
                        "Child3",
                        listOf(
                            RectangleNode(
                                RectanglePath(Dp(350f), Dp(450f), Dp(50f), Dp(50f)),
                                "Child5",
                                listOf(),
                            ),
                            RectangleNode(
                                RectanglePath(Dp(350f), Dp(550f), Dp(50f), Dp(50f)),
                                "Child6",
                                listOf(),
                            ),
                        ),
                    ),
                    RectangleNode(
                        RectanglePath(Dp(250f), Dp(400f), Dp(50f), Dp(50f)),
                        "Child4",
                        listOf(),
                    ),
                ),
            ),
            RectangleNode(
                RectanglePath(Dp(200f), Dp(300f), Dp(50f), Dp(50f)),
                "Child2",
                listOf(),
            ),
        ),
    )
}
