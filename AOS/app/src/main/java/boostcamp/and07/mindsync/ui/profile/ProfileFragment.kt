package boostcamp.and07.mindsync.ui.profile

import android.content.pm.PackageManager
import android.net.Uri
import android.widget.Toast
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.navigation.navGraphViewModels
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import boostcamp.and07.mindsync.databinding.FragmentProfileBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.util.ImagePickerHandler
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment : BaseFragment<FragmentProfileBinding>(R.layout.fragment_profile) {
    @Inject
    lateinit var profileRepository: ProfileRepository

    private val profileViewModel: ProfileViewModel by navGraphViewModels(R.id.nav_profile) {
        ProfileViewModelFactory(profileRepository)
    }
    private lateinit var imagePickerHandler: ImagePickerHandler

    override fun initView() {
        imagePickerHandler =
            ImagePickerHandler(requireActivity()) { uri ->
                createImage(uri)
            }
        setBinding()
        setupImageEdit()
        setupShowNicknameEditBtn()
        setupBackBtn()
        observeEvent()
    }

    private fun createImage(uri: Uri?) {
        uri?.let { imageUri ->
            profileViewModel.updateProfileUri(imageUri)
            profileViewModel.setProfileImageFile(File(imageUri.toAbsolutePath(requireContext())))
        }
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
            showDialog()
        }
    }

    private fun setupBackBtn() {
        binding.imgbtnProfileBack.setOnClickListener {
            requireActivity().finish()
        }
    }

    private fun showDialog() {
        findNavController().navigate(ProfileFragmentDirections.actionProfileFragmentToEditNickNameDialog())
    }

    private fun observeEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                profileViewModel.event.collectLatest { event ->
                    when (event) {
                        is ProfileUiEvent.NavigateToBack -> {
                            requireActivity().finish()
                        }

                        is ProfileUiEvent.ShowMessage -> {
                            Toast.makeText(
                                requireContext(),
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
        if (requestCode == ImagePickerHandler.REQUEST_CODE_PERMISSIONS && grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            imagePickerHandler.launchImagePicker()
        }
    }
}
