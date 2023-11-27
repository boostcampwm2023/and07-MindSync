package boostcamp.and07.mindsync.ui.mindmap

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.ui.util.Dp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class MindMapViewModel : ViewModel() {
    private val _tree = MutableStateFlow(Tree())
    val tree: StateFlow<Tree> = _tree
    private var _selectedNode = MutableStateFlow<Node?>(null)
    val selectedNode: StateFlow<Node?> = _selectedNode

    fun addNode(
        parent: Node,
        addNode: RectangleNode,
    ) {
        _tree.value.addNode(addNode.id, parent.id, addNode.description)
    }

    fun removeNode(target: Node) {
        _selectedNode.value = null
        _tree.value.removeNode(target.id)
    }

    fun setSelectedNode(selectNode: Node?) {
        _selectedNode.value = selectNode
    }

    fun updateNode(updateNode: Node) {
        _tree.value.updateNode(updateNode.id, updateNode.description)
    }

    fun update(newTree: Tree) {
        _tree.value = newTree
    }

    fun changeRootY(windowHeight: Dp) {
        _tree.value.setRoot(
            _tree.value.getRoot().copy(
                path = _tree.value.getRoot().path.copy(centerY = windowHeight),
            ),
        )
    }
}
