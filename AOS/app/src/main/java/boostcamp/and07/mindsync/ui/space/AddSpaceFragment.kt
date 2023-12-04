package boostcamp.and07.mindsync.ui.space

import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.FragmentAddSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment

class AddSpaceFragment : BaseFragment<FragmentAddSpaceBinding>(R.layout.fragment_add_space) {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()
    private val pickMedia =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { url ->
            url?.let {
                addSpaceViewModel.setSpaceThumbnail(url.toString())
            }
        }

    override fun initView() {
        setBinding()
    }

    private fun setBinding() {
        binding.vm = addSpaceViewModel
        binding.view = this
    }

    fun clickImageButton() {
        pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }
}
