package boostcamp.and07.mindsync.ui.profile

import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.activity.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityProfileBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.dialog.EditNickNameDialog
import boostcamp.and07.mindsync.ui.dialog.EditNickNameInterface
import boostcamp.and07.mindsync.ui.util.ImagePickerHandler
import boostcamp.and07.mindsync.ui.util.ImagePickerHandler.Companion.REQUEST_CODE_PERMISSIONS
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File

@AndroidEntryPoint
class ProfileActivity : BaseActivity<ActivityProfileBinding>(R.layout.activity_profile) {
    private val profileViewModel by viewModels<ProfileViewModel>()
    private val imagePickerHandler =
        ImagePickerHandler(this) { uri ->
            createImage(uri)
        }

    private fun createImage(uri: Uri?) {
        uri?.let { imageUri ->
            profileViewModel.updateProfileUri(imageUri)
            profileViewModel.setProfileImageFile(File(imageUri.toAbsolutePath(this)))
        }
    }

    override fun init() {
        setBinding()
        setupImageEdit()
        setupShowNicknameEditBtn()
        setupBackBtn()
        observeEvent()
    }

    private fun setBinding() {
        binding.vm = profileViewModel
    }

    private fun setupImageEdit() {
        binding.ivProfileImage.setOnClickListener {
            imagePickerHandler.checkPermissionsAndLaunchImagePicker()
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
                            Toast.makeText(
                                this@ProfileActivity,
                                "${event.message}",
                                Toast.LENGTH_SHORT,
                            ).show()
                        }
                    }
                }
            }
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            imagePickerHandler.launchImagePicker()
        }
    }
}
