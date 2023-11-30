package boostcamp.and07.mindsync.ui.view.listener

import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.Tree

interface NodeMoveListener {
    fun moveNode(
        tree: Tree,
        target: Node,
        parent: Node,
    )
}
