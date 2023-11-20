package boostcamp.and07.mindsync.ui.view

import boostcamp.and07.mindsync.data.model.Node

interface NodeClickListener {
    fun onDoubleClicked(node: Node,color:Int)
}
