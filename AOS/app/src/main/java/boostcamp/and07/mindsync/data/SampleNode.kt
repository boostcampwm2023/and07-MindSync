package boostcamp.and07.mindsync.data

import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.ColorRGB
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.RectanglePath
import boostcamp.and07.mindsync.ui.util.Dp

object SampleNode {
    val head: Node = CircleNode(
        CirclePath(
            Dp(100f),
            Dp(100f),
            Dp(50f),
        ),
        ColorRGB(100, 100, 100),
        "Root",
        listOf(
            RectangleNode(
                RectanglePath(Dp(200f), Dp(100f), Dp(50f), Dp(50f)),
                ColorRGB(200, 200, 200),
                "Child1",
                listOf(
                    RectangleNode(
                        RectanglePath(Dp(250f), Dp(200f), Dp(50f), Dp(50f)),
                        ColorRGB(30, 30, 30),
                        "Child3",
                        listOf(
                            RectangleNode(
                                RectanglePath(Dp(350f), Dp(450f), Dp(50f), Dp(50f)),
                                ColorRGB(50, 70, 80),
                                "Child5",
                                listOf(),
                            ),
                            RectangleNode(
                                RectanglePath(Dp(350f), Dp(550f), Dp(50f), Dp(50f)),
                                ColorRGB(100, 200, 100),
                                "Child6",
                                listOf(),
                            )
                        )
                    ),
                    RectangleNode(
                        RectanglePath(Dp(250f), Dp(400f), Dp(50f), Dp(50f)),
                        ColorRGB(10, 23, 40),
                        "Child4",
                        listOf(),
                    )
                )
            ),
            RectangleNode(
                RectanglePath(Dp(200f), Dp(300f), Dp(50f), Dp(50f)),
                ColorRGB(0, 0, 0),
                "Child2",
                listOf(),
            )
        )
    )
}
