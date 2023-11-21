package boostcamp.and07.mindsync.ui.mindmap

import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.databinding.FragmentMindmapBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.dialog.EditDescriptionDialog
import boostcamp.and07.mindsync.ui.dialog.EditDialogInterface
import boostcamp.and07.mindsync.ui.view.MindmapContainer
import kotlinx.coroutines.launch

class MindmapFragment : BaseFragment<FragmentMindmapBinding>(R.layout.fragment_mindmap) {

    private val mindMapViewModel: MindMapViewModel by viewModels()
    private val mindmapContainer = MindmapContainer()
    override fun initView() {
        setBinding()
        lifecycleScope.launch {
            mindMapViewModel.head.collect { newHead ->
                binding.zoomLayoutMindmapRoot.lineView.updateHead(newHead)
                binding.zoomLayoutMindmapRoot.nodeView.updateHead(newHead)
            }
        }
    }

    private fun setBinding() {
        binding.vm = mindMapViewModel
        binding.view = this
        mindmapContainer.setViewModel(mindMapViewModel)
        binding.zoomLayoutMindmapRoot.mindmapContainer = mindmapContainer
        binding.zoomLayoutMindmapRoot.initializeZoomLayout()
    }

    private fun showDialog(selectNode: Node, action: (Node, String) -> Unit) {
        val dialog = EditDescriptionDialog()
        dialog.setListener(object : EditDialogInterface {
            override fun onSubmitClick(description: String) {
                action.invoke(selectNode, description)
            }
        })
        dialog.show(activity?.supportFragmentManager!!, "EditDescriptionDialog")
    }

    fun addButtonListener(selectNode: Node) {
        showDialog(selectNode) { parent, description ->
            mindMapViewModel.addNode(parent, NodeGenerator.makeNode(description))
        }
    }

    fun editButtonListener(selectNode: Node) {
        showDialog(selectNode) { node, description ->
            val newNode = when (node) {
                is CircleNode -> node.copy(description = description)
                is RectangleNode -> node.copy(description = description)
            }
            mindMapViewModel.updateNode(newNode)
        }
    }
}
