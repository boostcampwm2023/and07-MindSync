package boostcamp.and07.mindsync.data

import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.ColorRGB
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.RectanglePath

object SampleNode {
    val head: Node = CircleNode(
        CirclePath(50f, 50f, 75f),
        ColorRGB(100, 100, 100),
        "Root",
        listOf(
            RectangleNode(
                RectanglePath(125f, 225f, 225f, 325f),
                ColorRGB(0, 0, 0),
                "Child1",
                listOf(
                    RectangleNode(
                        RectanglePath(125f, 225f, 225f, 325f),
                        ColorRGB(0, 0, 0),
                        "Child3",
                        listOf(
                            RectangleNode(
                                RectanglePath(125f, 225f, 225f, 325f),
                                ColorRGB(0, 0, 0),
                                "Child5",
                                listOf(),
                            ),
                            RectangleNode(
                                RectanglePath(125f, 225f, 425f, 525f),
                                ColorRGB(0, 0, 0),
                                "Child6",
                                listOf(),
                            ),
                        )
                    ),
                    RectangleNode(
                        RectanglePath(125f, 225f, 425f, 525f),
                        ColorRGB(0, 0, 0),
                        "Child4",
                        listOf(),
                    ),
                )
            ),
            RectangleNode(
                RectanglePath(125f, 225f, 425f, 525f),
                ColorRGB(0, 0, 0),
                "Child2",
                listOf(),
            ),
        )
    )
}
