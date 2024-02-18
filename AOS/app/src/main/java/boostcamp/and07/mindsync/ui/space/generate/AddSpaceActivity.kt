package boostcamp.and07.mindsync.ui.space.generate

import android.net.Uri
import androidx.activity.viewModels
import androidx.compose.runtime.Composable
import boostcamp.and07.mindsync.ui.base.BaseComposeActivity
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import java.io.File

@AndroidEntryPoint
class AddSpaceActivity : BaseComposeActivity() {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()

//    override fun init() {
//        //setBinding()
//        setBackBtn()
//        collectSpaceEvent()
//        //setClickEventThrottle()
//    }

//    override fun getViewModel(): BaseActivityViewModel {
//        return addSpaceViewModel
//    }
//
//    private fun setBinding() {
//        binding.vm = addSpaceViewModel
//    }
//
//    private fun setClickEventThrottle() {
//        binding.imgbtnUpdateSpaceThumbnail.setClickEvent(lifecycleScope) {
//            imagePickerHandler.checkPermissionsAndLaunchImagePicker()
//        }
//    }

//    private fun collectSpaceEvent() {
//        lifecycleScope.launch {
//            repeatOnLifecycle(Lifecycle.State.STARTED) {
//                addSpaceViewModel.event.collectLatest { spaceEvent ->
//                    when (spaceEvent) {
//                        is SpaceUiEvent.SuccessAdd -> {
//                            finish()
//                        }
//
//                        is SpaceUiEvent.ShowMessage -> { // 에러일 경우가 잇나?
//                            showMessage(spaceEvent.message)
//                        }
//
//                        else -> {}
//                    }
//                }
//            }
//        }
//    }

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            val file = File(uri.toAbsolutePath(this))
            addSpaceViewModel.setSpaceThumbnail(uri.toString())
            addSpaceViewModel.setImageFile(file)
        }
    }

    @Composable
    override fun Content() {
        MindSyncTheme {
            AddSpaceScreen(
                onBackClicked = { this.finish() },
                addSpaceViewModel = addSpaceViewModel,
                createSpace = { addSpaceViewModel.addSpace(it) },
                updateSpaceName = { addSpaceViewModel.onSpaceNameChanged(it, 0, 0, 0) },
                createImage = { createImage(it) },
            )
        }
    }

//    override fun onRequestPermissionsResult(
//        requestCode: Int,
//        permissions: Array<out String>,
//        grantResults: IntArray,
//    ) {
//        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
//        if (requestCode == ImagePickerHandler.REQUEST_CODE_PERMISSIONS &&
//            grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
//        ) {
//            imagePickerHandler.launchImagePicker()
//        }
//    }
}
