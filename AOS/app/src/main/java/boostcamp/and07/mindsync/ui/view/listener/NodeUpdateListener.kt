package boostcamp.and07.mindsync.ui.view.listener

import boostcamp.and07.mindsync.data.model.Node

interface NodeUpdateListener {
    fun updateHead(head: Node)
}
