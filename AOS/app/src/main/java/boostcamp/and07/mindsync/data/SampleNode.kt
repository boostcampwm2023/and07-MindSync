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
            Dp(500f),
            Dp(800f),
            Dp(75f),
        ),
        ColorRGB(100, 100, 100),
        "Root",
        listOf(
            RectangleNode(
                RectanglePath(Dp(125f), Dp(225f), Dp(225f), Dp(325f)),
                ColorRGB(200, 200, 200),
                "Child1",
                listOf(
                    RectangleNode(
                        RectanglePath(Dp(425f), Dp(525f), Dp(325f), Dp(625f)),
                        ColorRGB(30, 30, 30),
                        "Child3",
                        listOf(
                            RectangleNode(
                                RectanglePath(Dp(725f), Dp(825f), Dp(825f), Dp(925f)),
                                ColorRGB(50, 70, 80),
                                "Child5",
                                listOf(),
                            ),
                            RectangleNode(
                                RectanglePath(Dp(225f), Dp(325f), Dp(525f), Dp(625f)),
                                ColorRGB(100, 200, 100),
                                "Child6",
                                listOf(),
                            ),
                        ),
                    ),
                    RectangleNode(
                        RectanglePath(Dp(325f), Dp(525f), Dp(625f), Dp(725f)),
                        ColorRGB(10, 23, 40),
                        "Child4",
                        listOf(),
                    ),
                ),
            ),
            RectangleNode(
                RectanglePath(Dp(125f), Dp(225f), Dp(425f), Dp(525f)),
                ColorRGB(0, 0, 0),
                "Child2",
                listOf(),
            ),
        ),
    )
}
