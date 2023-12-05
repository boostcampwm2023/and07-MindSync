package boostcamp.and07.mindsync.ui.space

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat.checkSelfPermission
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityAddSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.util.SpaceExceptionMessage
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File

@AndroidEntryPoint
class AddSpaceActivity : BaseActivity<ActivityAddSpaceBinding>(R.layout.activity_add_space) {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()
    private val pickMedia =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { url ->
            url?.let {
                val file = File(url.toAbsolutePath(this))
                addSpaceViewModel.setSpaceThumbnail(url.toString())
                addSpaceViewModel.setImageFile(file)
            }
        }
    private val galleryPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                launchImagePicker()
            }
        }

    private val imageResult =
        registerForActivityResult(
            ActivityResultContracts.StartActivityForResult(),
        ) { result ->
            if (result.resultCode == RESULT_OK) {
                result.data?.data?.let { uri ->
                    createImage(uri)
                }
            }
        }

    override fun init() {
        setBinding()
        setBackBtn()
        collectSpaceEvent()
    }

    private fun setBinding() {
        binding.vm = addSpaceViewModel
        binding.view = this
    }

    fun clickImageButton() {
        checkPermissionsAndLaunchImagePicker()
    }

    private fun collectSpaceEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                addSpaceViewModel.spaceEvent.collectLatest { spaceEvent ->
                    when (spaceEvent) {
                        is SpaceEvent.Success -> {
                            finish()
                        }

                        is Error -> {
                            Snackbar.make(
                                binding.root,
                                SpaceExceptionMessage.ERROR_MESSAGE_SPACE_ADD.message,
                                Snackbar.LENGTH_SHORT,
                            )
                                .show()
                        }
                    }
                }
            }
        }
    }

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            addSpaceViewModel.setSpaceThumbnail(uri.toString())
        }
    }

    private fun setBackBtn() {
        binding.imgbtnAddSpaceBack.setOnClickListener {
            finish()
        }
    }

    private fun checkPermissionsAndLaunchImagePicker() {
        when {
            checkSelfPermission(
                this,
                getPermissionReadMediaImagesOrReadExternalStorage(),
            ) == PackageManager.PERMISSION_GRANTED -> {
                launchImagePicker()
            }

            shouldShowRequestPermissionRationale(
                getPermissionReadMediaImagesOrReadExternalStorage(),
            ) -> {
                requestGalleryPermission()
            }

            else -> {
                requestGalleryPermission()
            }
        }
    }

    private fun launchImagePicker() {
        pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    private fun getPermissionReadMediaImagesOrReadExternalStorage() =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_IMAGES
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }

    private fun requestGalleryPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            galleryPermissionLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
        } else {
            checkPermissionAndLaunchImageSelector()
        }
    }

    private fun checkPermissionAndLaunchImageSelector() {
        val readPermission =
            checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)

        if (readPermission == PackageManager.PERMISSION_GRANTED) {
            launchImageSelector()
        } else {
            requestExternalStoragePermission()
        }
    }

    private fun requestExternalStoragePermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE),
            REQUEST_CODE_PERMISSIONS,
        )
    }

    private fun launchImageSelector() {
        val intent =
            Intent(Intent.ACTION_PICK).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
            }
        imageResult.launch(intent)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            launchImagePicker()
        }
    }

    companion object {
        private const val REQUEST_CODE_PERMISSIONS = 1
    }
}
