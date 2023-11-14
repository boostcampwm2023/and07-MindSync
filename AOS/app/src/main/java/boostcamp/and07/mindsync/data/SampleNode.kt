package boostcamp.and07.mindsync.data

import boostcamp.and07.mindsync.data.model.CirclePath
import boostcamp.and07.mindsync.data.model.ColorRGB
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectanglePath

object SampleNode {
    val head: Node = Node(
        CirclePath(50f, 50f, 75f),
        ColorRGB(100f, 100f, 100f),
        "Root",
        listOf(
            Node(
                RectanglePath(125f, 225f, 225f, 325f),
                ColorRGB(0f, 0f, 0f),
                "Child1",
                listOf(
                    Node(
                        RectanglePath(125f, 225f, 225f, 325f),
                        ColorRGB(0f, 0f, 0f),
                        "Child3",
                        listOf(
                            Node(
                                RectanglePath(125f, 225f, 225f, 325f),
                                ColorRGB(0f, 0f, 0f),
                                "Child5",
                                listOf(),
                            ),
                            Node(
                                RectanglePath(125f, 225f, 425f, 525f),
                                ColorRGB(0f, 0f, 0f),
                                "Child6",
                                listOf(),
                            ),
                        )
                    ),
                    Node(
                        RectanglePath(125f, 225f, 425f, 525f),
                        ColorRGB(0f, 0f, 0f),
                        "Child4",
                        listOf(),
                    ),
                )
            ),
            Node(
                RectanglePath(125f, 225f, 425f, 525f),
                ColorRGB(0f, 0f, 0f),
                "Child2",
                listOf(),
            ),
        )
    )
}
