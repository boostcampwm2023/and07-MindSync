package boostcamp.and07.mindsync.ui.view

import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.ui.view.listener.NodeClickListener
import boostcamp.and07.mindsync.ui.view.listener.NodeUpdateListener

class MindmapContainer {

    lateinit var head: Node
    var selectNode: Node? = null
    private var nodeClickListener: NodeClickListener? = null
    private var nodeUpdateListener: NodeUpdateListener? = null
    fun setNodeClickListener(clickListener: NodeClickListener) {
        this.nodeClickListener = clickListener
    }

    fun setNodeUpdateListener(updateListener: NodeUpdateListener) {
        this.nodeUpdateListener = updateListener
    }

    fun updateHead(head: Node) {
        this.head = head
        nodeUpdateListener?.updateHead(head)
    }

    fun setSelectedNode(selectedNode: Node?) {
        this.selectNode = selectedNode
        nodeClickListener?.clickNode(selectedNode)
    }
}
