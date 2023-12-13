package boostcamp.and07.mindsync.ui.mindmap

import android.content.Context
import android.util.Log
import androidx.activity.OnBackPressedCallback
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.navigation.navGraphViewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.crdt.OperationType
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.Tree
import boostcamp.and07.mindsync.data.network.SocketState
import boostcamp.and07.mindsync.databinding.FragmentMindMapBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
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
    private val mindMapViewModel: MindMapViewModel by navGraphViewModels(R.id.nav_graph) {
        MindMapViewModelFactory()
    }
    private lateinit var mindMapContainer: MindMapContainer
    private val args: MindMapFragmentArgs by navArgs()
    private var isBack = false

    override fun onAttach(context: Context) {
        super.onAttach(context)
        val callback =
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    isBack = true
                    findNavController().popBackStack()
                }
            }
        requireActivity().onBackPressedDispatcher.addCallback(this, callback)
    }

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
        val screenWidth = Dp(Px(displayMetrics.widthPixels.toFloat()).toDp(requireContext()))
        mindMapViewModel.changeRootXY(screenWidth / 2, screenHeight / 2)
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
        operationType: OperationType,
        selectedNode: Node,
    ) {
        findNavController().navigate(
            MindMapFragmentDirections.actionMindMapFragmentToEditDescriptionDialog(
                operationType,
                selectedNode,
            ),
        )
    }

    private fun setClickEventThrottle() {
        with(binding) {
            imgbtnMindMapAdd.setClickEvent(
                lifecycleScope,
                ThrottleDuration.SHORT_DURATION.duration,
            ) {
                mindMapViewModel.selectedNode.value?.let { selectNode ->
                    showDialog(OperationType.ADD, selectNode)
                }
            }
            imgbtnMindMapEdit.setClickEvent(
                lifecycleScope,
                ThrottleDuration.SHORT_DURATION.duration,
            ) {
                mindMapViewModel.selectedNode.value?.let { selectNode ->
                    showDialog(OperationType.UPDATE, selectNode)
                }
            }
            imgbtnMindMapRemove.setClickEvent(
                lifecycleScope,
                ThrottleDuration.SHORT_DURATION.duration,
            ) {
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

    override fun onDestroyView() {
        super.onDestroyView()
        if (isBack) {
            mindMapViewModel.clearTree()
        }
    }
}
