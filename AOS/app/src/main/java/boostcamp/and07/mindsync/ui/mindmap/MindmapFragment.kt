package boostcamp.and07.mindsync.ui.mindmap

import androidx.fragment.app.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentMindmapBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment

class MindmapFragment : BaseFragment<FragmentMindmapBinding>(R.layout.fragment_mindmap) {

    private val mindMapViewModel: MindMapViewModel by viewModels()
    override fun initView() {
        binding.vm = mindMapViewModel
        binding.viewNode.setViewModel(mindMapViewModel)
    }
}
