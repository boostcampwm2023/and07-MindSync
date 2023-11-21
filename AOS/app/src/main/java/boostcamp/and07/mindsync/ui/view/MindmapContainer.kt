package boostcamp.and07.mindsync.ui.view

import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.ui.mindmap.MindMapViewModel

class MindmapContainer {

    lateinit var mindMapViewModel: MindMapViewModel
    lateinit var head: Node

    var nodeView: NodeView? = null
    var lineView: LineView? = null

    fun setViewModel(mindMapViewModel: MindMapViewModel) {
        this.mindMapViewModel = mindMapViewModel
        head = mindMapViewModel.head.value
    }

    fun updateHead(newHead: Node) {
        head = newHead
        lineView?.updateWithNewHead(newHead)
    }
}
