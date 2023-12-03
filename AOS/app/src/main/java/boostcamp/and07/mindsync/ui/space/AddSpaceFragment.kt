package boostcamp.and07.mindsync.ui.space

import androidx.fragment.app.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentAddSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment

class AddSpaceFragment : BaseFragment<FragmentAddSpaceBinding>(R.layout.fragment_add_space) {

    private val addSpaceViewModel: AddSpaceViewModel by viewModels()
    override fun initView() {
        setBinding()
    }

    private fun setBinding() {
        binding.vm = addSpaceViewModel
    }
}
