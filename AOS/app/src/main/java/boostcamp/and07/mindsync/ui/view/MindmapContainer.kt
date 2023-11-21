package boostcamp.and07.mindsync.ui.view

import boostcamp.and07.mindsync.data.SampleNode
import boostcamp.and07.mindsync.data.model.Node

class MindmapContainer {
    var head: Node = SampleNode.head

    var nodeView: NodeView? = null
    var lineView: LineView? = null

    fun updateHead(newHead: Node) {
        head = newHead
        lineView?.updateWithNewHead(newHead)
    }
}