package boostcamp.and07.mindsync.ui.mindmap

import android.util.Log
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.NodeGenerator
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.data.network.SocketState
import boostcamp.and07.mindsync.databinding.FragmentMindMapBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.dialog.EditDescriptionDialog
import boostcamp.and07.mindsync.ui.dialog.EditDialogInterface
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.Px
import boostcamp.and07.mindsync.ui.util.ThrottleDuration
import boostcamp.and07.mindsync.ui.util.setClickEvent
import boostcamp.and07.mindsync.ui.util.toDp
import boostcamp.and07.mindsync.ui.view.MindMapContainer
import boostcamp.and07.mindsync.ui.view.listener.NodeClickListener
import boostcamp.and07.mindsync.ui.view.listener.NodeMoveListener
import boostcamp.and07.mindsync.ui.view.listener.TreeUpdateListener
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MindMapFragment :
    BaseFragment<FragmentMindMapBinding>(R.layout.fragment_mind_map),
    NodeClickListener,
    TreeUpdateListener,
    NodeMoveListener {
    private val mindMapViewModel: MindMapViewModel by viewModels()
    private lateinit var mindMapContainer: MindMapContainer
    private val args: MindMapFragmentArgs by navArgs()

    override fun initView() {
        setupRootNode()
        setBinding()
        collectOperation()
        collectSelectedNode()
        collectSocketState()
        setClickEventThrottle()
        mindMapViewModel.setBoard(args.boardId, args.boardName)
    }

    private fun collectSocketState() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                mindMapViewModel.socketState.collectLatest { state ->
                    when (state) {
                        SocketState.CONNECT -> {
                        }

                        SocketState.DISCONNECT -> {
                            Log.d("MindMapFragment", "collectSocketState: disconnect")
                        }

                        SocketState.ERROR -> {
                            Log.d("MindMapFragment", "collectSocketState: error")
                        }
                    }
                }
            }
        }
    }

    private fun collectOperation() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                mindMapViewModel.operation.collectLatest {
                    mindMapContainer.update(mindMapViewModel.crdtTree.tree)
                    binding.zoomLayoutMindMapRoot.lineView.updateTree(mindMapContainer.tree)
                    binding.zoomLayoutMindMapRoot.nodeView.updateTree(mindMapContainer.tree)
                }
            }
        }
    }

    private fun setupRootNode() {
        val displayMetrics = requireActivity().resources.displayMetrics
        val screenHeight = Dp(Px(displayMetrics.heightPixels.toFloat()).toDp(requireContext()))
        mindMapViewModel.changeRootY(screenHeight / 2)
    }

    private fun setBinding() {
        binding.vm = mindMapViewModel
        mindMapContainer = MindMapContainer(requireContext())
        mindMapContainer.setNodeClickListener(this)
        mindMapContainer.setTreeUpdateListener(this)
        mindMapContainer.setNodeMoveListener(this)
        binding.zoomLayoutMindMapRoot.mindMapContainer = mindMapContainer
        binding.zoomLayoutMindMapRoot.initializeZoomLayout()
    }

    private fun collectSelectedNode() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                mindMapViewModel.selectedNode.collectLatest { selectNode ->
                    mindMapContainer.setSelectedNode(selectNode)
                }
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

    private fun setClickEventThrottle() {
        with(binding) {
            imgbtnMindMapAdd.setClickEvent(lifecycleScope, ThrottleDuration.SHORT_DURATION.duration) {
                mindMapViewModel.selectedNode.value?.let { selectNode ->
                    showDialog(selectNode) { parent, description ->
                        mindMapViewModel.addNode(parent, NodeGenerator.makeNode(description, parent.id))
                    }
                }
            }
            imgbtnMindMapEdit.setClickEvent(lifecycleScope, ThrottleDuration.SHORT_DURATION.duration) {
                mindMapViewModel.selectedNode.value?.let { selectNode ->
                    showDialog(selectNode) { node, description ->
                        val newNode =
                            when (node) {
                                is CircleNode -> node.copy(description = description)
                                is RectangleNode -> node.copy(description = description)
                            }
                        mindMapViewModel.updateNode(newNode)
                    }
                }
            }
            imgbtnMindMapRemove.setClickEvent(lifecycleScope, ThrottleDuration.SHORT_DURATION.duration) {
                mindMapViewModel.selectedNode.value?.let { selectNode ->
                    mindMapViewModel.removeNode(selectNode)
                }
            }
        }
    }

    override fun clickNode(node: Node?) {
        mindMapViewModel.setSelectedNode(node)
    }

    override fun updateTree(tree: Tree) {
        mindMapViewModel.update(tree)
    }

    override fun moveNode(
        tree: Tree,
        target: Node,
        parent: Node,
    ) {
        mindMapViewModel.moveNode(tree, target, parent)
    }
}
