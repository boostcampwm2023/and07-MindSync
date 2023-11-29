package boostcamp.and07.mindsync.ui.view

import android.content.Context
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.view.layout.MeasureTextSize
import boostcamp.and07.mindsync.ui.view.layout.MindMapRightLayoutManager
import boostcamp.and07.mindsync.ui.view.listener.NodeClickListener
import boostcamp.and07.mindsync.ui.view.listener.TreeUpdateListener

class MindMapContainer(context: Context) {
    lateinit var tree: Tree
    var selectNode: Node? = null
    private var nodeClickListener: NodeClickListener? = null
    private var treeUpdateListener: TreeUpdateListener? = null
    private val rightLayoutManager = MindMapRightLayoutManager()
    private val measureTextSize = MeasureTextSize(context)

    fun setNodeClickListener(clickListener: NodeClickListener) {
        this.nodeClickListener = clickListener
    }

    fun setTreeUpdateListener(updateListener: TreeUpdateListener) {
        this.treeUpdateListener = updateListener
    }

    fun update(tree: Tree) {
        this.tree = tree
        measureTextSize.traverseTextHead(tree)
        rightLayoutManager.arrangeNode(tree)
        treeUpdateListener?.updateTree(tree)
    }

    fun setSelectedNode(selectedNode: Node?) {
        this.selectNode = selectedNode
        nodeClickListener?.clickNode(selectedNode)
    }
}
