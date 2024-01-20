package boostcamp.and07.mindsync.ui.space.generate

import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityAddSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import boostcamp.and07.mindsync.ui.util.ImagePickerHandler
import boostcamp.and07.mindsync.ui.util.setClickEvent
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File

@AndroidEntryPoint
class AddSpaceActivity : BaseActivity<ActivityAddSpaceBinding>(R.layout.activity_add_space) {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()
    private val imagePickerHandler =
        ImagePickerHandler(this) { uri ->
            createImage(uri)
        }

    override fun init() {
        setBinding()
        setBackBtn()
        collectSpaceEvent()
        setClickEventThrottle()
    }

    override fun getViewModel(): BaseActivityViewModel {
        return addSpaceViewModel
    }

    private fun setBinding() {
        binding.vm = addSpaceViewModel
    }

    private fun setClickEventThrottle() {
        binding.imgbtnUpdateSpaceThumbnail.setClickEvent(lifecycleScope) {
            imagePickerHandler.checkPermissionsAndLaunchImagePicker()
        }
    }

    private fun collectSpaceEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                addSpaceViewModel.event.collectLatest { spaceEvent ->
                    when (spaceEvent) {
                        is SpaceUiEvent.SuccessAdd -> {
                            finish()
                        }
                        is SpaceUiEvent.ShowMessage -> { // 에러일 경우가 잇나?
                            showMessage(spaceEvent.message)
                        }
                        else -> {}
                    }
                }
            }
        }
    }

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            val file = File(uri.toAbsolutePath(this))
            addSpaceViewModel.setSpaceThumbnail(uri.toString())
            addSpaceViewModel.setImageFile(file)
        }
    }

    private fun setBackBtn() {
        binding.imgbtnAddSpaceBack.setOnClickListener {
            finish()
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == ImagePickerHandler.REQUEST_CODE_PERMISSIONS &&
            grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            imagePickerHandler.launchImagePicker()
        }
    }
}
