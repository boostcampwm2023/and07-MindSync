package boostcamp.and07.mindsync.ui.mindmap

import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.databinding.FragmentMindMapBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.dialog.EditDescriptionDialog
import boostcamp.and07.mindsync.ui.dialog.EditDialogInterface
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.Px
import boostcamp.and07.mindsync.ui.util.toDp
import boostcamp.and07.mindsync.ui.view.MindMapContainer
import boostcamp.and07.mindsync.ui.view.listener.NodeClickListener
import boostcamp.and07.mindsync.ui.view.listener.NodeUpdateListener
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MindMapFragment :
    BaseFragment<FragmentMindMapBinding>(R.layout.fragment_mind_map),
    NodeClickListener,
    NodeUpdateListener {
    private val mindMapViewModel: MindMapViewModel by viewModels()
    private lateinit var mindMapContainer: MindMapContainer

    override fun initView() {
        setupRootNode()
        setBinding()
        collectHead()
        collectSelectedNode()
    }

    private fun setupRootNode() {
        val displayMetrics = requireActivity().resources.displayMetrics
        val screenHeight = Dp(Px(displayMetrics.heightPixels.toFloat()).toDp(requireContext()))
        mindMapViewModel.updateHead(screenHeight / 2)
    }

    private fun setBinding() {
        binding.vm = mindMapViewModel
        binding.view = this
        mindMapContainer = MindMapContainer(requireContext())
        mindMapContainer.setNodeClickListener(this)
        mindMapContainer.setNodeUpdateListener(this)
        binding.zoomLayoutMindMapRoot.mindMapContainer = mindMapContainer
        binding.zoomLayoutMindMapRoot.initializeZoomLayout()
    }

    private fun collectHead() {
        viewLifecycleOwner.lifecycleScope.launch {
            mindMapViewModel.head.collectLatest { newHead ->
                mindMapContainer.updateHead(newHead)
                binding.zoomLayoutMindMapRoot.lineView.updateHead(mindMapContainer.head)
                binding.zoomLayoutMindMapRoot.nodeView.updateHead(mindMapContainer.head)
            }
        }
    }

    private fun collectSelectedNode() {
        viewLifecycleOwner.lifecycleScope.launch {
            mindMapViewModel.selectedNode.collectLatest { selectNode ->
                mindMapContainer.setSelectedNode(selectNode)
            }
        }
    }

    private fun showDialog(
        selectNode: Node,
        action: (Node, String) -> Unit,
    ) {
        val dialog = EditDescriptionDialog()
        dialog.setListener(
            object : EditDialogInterface {
                override fun onSubmitClick(description: String) {
                    action.invoke(selectNode, description)
                }
            },
        )
        dialog.show(requireActivity().supportFragmentManager, "EditDescriptionDialog")
    }

    fun addButtonListener(selectNode: Node) {
        showDialog(selectNode) { parent, description ->
            mindMapViewModel.addNode(parent, NodeGenerator.makeNode(description, parent.id))
        }
    }

    fun editButtonListener(selectNode: Node) {
        showDialog(selectNode) { node, description ->
            val newNode =
                when (node) {
                    is CircleNode -> node.copy(description = description)
                    is RectangleNode -> node.copy(description = description)
                }
            mindMapViewModel.updateNode(newNode)
        }
    }

    override fun clickNode(node: Node?) {
        mindMapViewModel.setSelectedNode(node)
    }

    override fun updateHead(head: Node) {
        mindMapViewModel.updateHead(head)
    }
}
