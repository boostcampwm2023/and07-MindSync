package boostcamp.and07.mindsync.ui.mindmap

import android.util.Log
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Node
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
                binding.rootView.lineView.updateHead(newHead)
                binding.rootView.nodeView.updateHead(newHead)
            }
        }
    }

    private fun setBinding() {
        binding.vm = mindMapViewModel
        binding.view = this
        mindmapContainer.setViewModel(mindMapViewModel)
        binding.rootView.mindmapContainer = mindmapContainer
        binding.rootView.run()
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
        showDialog(selectNode) { node, description ->
            mindMapViewModel.addNode(node, description)
        }
    }
}
