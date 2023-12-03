package boostcamp.and07.mindsync.ui.space

import android.util.Log
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
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
        binding.view = this
    }

    fun clickImageButton() {
        findNavController().navigate(R.id.action_to_chooseSpaceImageDialog)
    }
}
