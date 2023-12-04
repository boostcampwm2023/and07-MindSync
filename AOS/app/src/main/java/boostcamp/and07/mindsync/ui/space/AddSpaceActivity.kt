package boostcamp.and07.mindsync.ui.space

import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityAddSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import java.io.File

@AndroidEntryPoint
class AddSpaceActivity : BaseActivity<ActivityAddSpaceBinding>(R.layout.activity_add_space) {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()
    private val pickMedia =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { url ->
            url?.let {
                addSpaceViewModel.setSpaceThumbnail(url.toString())
            }
        }

    override fun init() {
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
