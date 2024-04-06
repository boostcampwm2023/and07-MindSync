package boostcamp.and07.mindsync.ui.profile

import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.View
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.navigation.navGraphViewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import boostcamp.and07.mindsync.ui.base.BaseComposeFragment
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.util.ImagePickerHandler
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import java.io.File
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment : BaseComposeFragment() {
    @Inject
    lateinit var profileRepository: ProfileRepository

    @Inject
    lateinit var loginEveRepository: LogoutEventRepository

    private val profileViewModel: ProfileViewModel by navGraphViewModels(R.id.nav_profile) {
        ProfileViewModelFactory(profileRepository, loginEveRepository)
    }

    private lateinit var imagePickerHandler: ImagePickerHandler

    override fun onViewCreated(
        view: View,
        savedInstanceState: Bundle?,
    ) {
        super.onViewCreated(view, savedInstanceState)
        imagePickerHandler =
            ImagePickerHandler(requireActivity()) { uri ->
                createImage(uri)
            }
    }

    @Composable
    override fun Screen() {
        MindSyncTheme {
            ProfileScreen(
                profileViewModel = profileViewModel,
                onBack = { requireActivity().finish() },
                updateNickname = { profileViewModel.updateNickName(it) },
                updateProfile = { profileViewModel.updateProfile(it) },
                editNickname = { profileViewModel.editNickname(it) },
                showDialog = { profileViewModel.showNicknameDialog(it) },
                showImagePicker = { imagePickerHandler.checkPermissionsAndLaunchImagePicker() },
            )
        }
    }

    private fun createImage(uri: Uri?) {
        uri?.let { imageUri ->
            profileViewModel.updateProfileUri(imageUri)
            profileViewModel.setProfileImageFile(File(imageUri.toAbsolutePath(requireContext())))
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        if (requestCode == ImagePickerHandler.REQUEST_CODE_PERMISSIONS && grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            imagePickerHandler.launchImagePicker()
        }
    }
}
