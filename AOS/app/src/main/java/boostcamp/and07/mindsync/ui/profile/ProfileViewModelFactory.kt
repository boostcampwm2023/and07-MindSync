package boostcamp.and07.mindsync.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository

class ProfileViewModelFactory(
    private val profileRepository: ProfileRepository,
    private val logoutEventRepository: LogoutEventRepository,
) :
    ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProfileViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ProfileViewModel(profileRepository, logoutEventRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
