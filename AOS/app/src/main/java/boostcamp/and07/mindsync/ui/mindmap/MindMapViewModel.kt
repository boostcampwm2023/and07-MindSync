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
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.addNode(addNode.id, parent.id, addNode.description)
        _tree.value = newTree
    }

    fun removeNode(target: Node) {
        _selectedNode.value = null
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.removeNode(target.id)
        _tree.value = newTree
    }

    fun setSelectedNode(selectNode: Node?) {
        _selectedNode.value = selectNode
    }

    fun updateNode(updateNode: Node) {
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.updateNode(updateNode.id, updateNode.description)
        _tree.value = newTree
    }

    fun update(newTree: Tree) {
        _tree.value = newTree
    }

    fun changeRootY(windowHeight: Dp) {
        val newTree = _tree.value.copy(_tree.value.nodes)
        newTree.setRoot(
            _tree.value.getRoot().copy(
                path = _tree.value.getRoot().path.copy(centerY = windowHeight),
            ),
        )
        _tree.value = newTree
    }
}
