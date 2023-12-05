package boostcamp.and07.mindsync.ui.profile

import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityProfileBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProfileActivity : BaseActivity<ActivityProfileBinding>(R.layout.activity_profile) {
    
    private val imagePickerLauncher =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
            createImage(uri)
        }

    private val galleryPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                launchImagePicker()
            }
        }

    private val imageResult = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri ->
                createImage(uri)
            }
        }
    }

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            profileViewModel.updateProfileUri(uri)
        }
    }

    private fun launchImagePicker() {
        imagePickerLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    override fun init() {

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
        val readPermission = checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)

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
        val intent = Intent(Intent.ACTION_PICK).apply {
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
