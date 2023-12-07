package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import boostcamp.and07.mindsync.ui.util.toRequestBody
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel
    @Inject
    constructor(
        private val profileRepository: ProfileRepository,
    ) :
    ViewModel() {
        private val _uiState = MutableStateFlow(ProfileUiState())
        val uiState: StateFlow<ProfileUiState> = _uiState
        private val _event = MutableSharedFlow<ProfileUiEvent>()
        val event: SharedFlow<ProfileUiEvent> = _event
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(ProfileUiEvent.ShowMessage(throwable.message.toString())) }
            }

        fun updateProfileUri(uri: Uri) {
            _uiState.update { uiState ->
                uiState.copy(imageUri = uri)
            }
        }

    fun updateNickName(nickname: CharSequence) {
        _uiState.update { uiState ->
            uiState.copy(nickname = nickname.toString())
        }
    }

        fun setProfileImageFile(file: File) {
            _uiState.update { uiState ->
                uiState.copy(imageFile = file)
            }
        }

    fun updateProfile(imageName: String) {
        val image = _uiState.value.imageFile?.let { file ->
            fileToMultiPart(file, imageName)
        }
        val nickname = _uiState.value.nickname.toRequestBody()

        viewModelScope.launch(coroutineExceptionHandler) {
            profileRepository.patchProfile(nickname, image).collectLatest {
                _event.emit(ProfileUiEvent.NavigateToBack)
            }
        }
    }

        fun fetchProfile() {
            viewModelScope.launch(coroutineExceptionHandler) {
                profileRepository.getProfile().collectLatest { profile ->
                    _uiState.update { uiState ->
                        uiState.copy(
                            nickname = profile.nickname,
                            imageUri = Uri.parse(profile.imageUrl),
                        )
                    }
                }
            }
        }
    }
