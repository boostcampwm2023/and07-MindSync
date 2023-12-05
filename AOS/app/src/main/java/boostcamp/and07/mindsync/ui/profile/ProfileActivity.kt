package boostcamp.and07.mindsync.ui.profile

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
import boostcamp.and07.mindsync.databinding.ActivityProfileBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.dialog.EditNickNameDialog
import boostcamp.and07.mindsync.ui.dialog.EditNickNameInterface
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ProfileActivity : BaseActivity<ActivityProfileBinding>(R.layout.activity_profile) {
    private val profileViewModel by viewModels<ProfileViewModel>()

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

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            profileViewModel.updateProfileUri(uri)
        }
    }

    private fun launchImagePicker() {
        imagePickerLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    override fun init() {
        setBinding()
        setupImageEditBtn()
        setupShowNicknameEditBtn()
        setupBackBtn()
        observeEvent()
    }

    private fun setBinding() {
        binding.vm = profileViewModel
    }

    private fun setupImageEditBtn() {
        binding.btnProfileImageEdit.setOnClickListener {
            checkPermissionsAndLaunchImagePicker()
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

    private fun setupShowNicknameEditBtn() {
        binding.imgbtnProfileNicknameEdit.setOnClickListener {
            showDialog { nickName ->
                profileViewModel.updateNickName(nickName)
            }
        }
    }

    private fun setupBackBtn() {
        binding.imgbtnProfileBack.setOnClickListener {
            finish()
        }
    }

    private fun showDialog(action: (String) -> Unit) {
        val dialog = EditNickNameDialog()
        dialog.setListener(
            object : EditNickNameInterface {
                override fun onModifyClick(nickname: String) {
                    action.invoke(nickname)
                }
            },
        )
        dialog.show(this.supportFragmentManager, "EditNickNameDialog")
    }

    private fun observeEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                profileViewModel.event.collectLatest { event ->
                    when (event) {
                        is ProfileUiEvent.NavigateToBack -> {
                            finish()
                        }

                        is ProfileUiEvent.ShowMessage -> {
                        }
                    }
                }
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
