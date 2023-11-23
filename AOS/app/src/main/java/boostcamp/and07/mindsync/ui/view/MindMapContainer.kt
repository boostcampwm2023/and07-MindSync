package boostcamp.and07.mindsync.ui.view

import android.content.Context
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.ui.view.layout.MeasureTextSize
import boostcamp.and07.mindsync.ui.view.layout.MindMapRightLayoutManager
import boostcamp.and07.mindsync.ui.view.listener.NodeClickListener
import boostcamp.and07.mindsync.ui.view.listener.NodeUpdateListener

class MindMapContainer(context: Context) {

    lateinit var head: Node
    var selectNode: Node? = null
    private var nodeClickListener: NodeClickListener? = null
    private var nodeUpdateListener: NodeUpdateListener? = null
    private val rightLayoutManager = MindMapRightLayoutManager()
    private val measureTextSize = MeasureTextSize(context)

    fun setNodeClickListener(clickListener: NodeClickListener) {
        this.nodeClickListener = clickListener
    }

    fun setNodeUpdateListener(updateListener: NodeUpdateListener) {
        this.nodeUpdateListener = updateListener
    }

    fun updateHead(head: Node) {
        this.head = rightLayoutManager.arrangeNode(measureTextSize.traverseTextHead(head))
        nodeUpdateListener?.updateHead(head)
    }

    fun setSelectedNode(selectedNode: Node?) {
        this.selectNode = selectedNode
        nodeClickListener?.clickNode(selectedNode)
    }
}
