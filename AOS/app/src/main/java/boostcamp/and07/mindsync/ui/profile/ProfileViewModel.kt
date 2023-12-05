package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
) :
    ViewModel() {
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState
    private val _event = MutableSharedFlow<ProfileUiEvent>()
    val event: SharedFlow<ProfileUiEvent> = _event

    fun updateProfileUri(uri: Uri) {
        _uiState.update { uiState ->
            uiState.copy(imageUri = uri)
        }
    }

    fun updateNickName(nickname: String) {
        _uiState.update { uiState ->
            uiState.copy(nickname = nickname)
        }
    }
}
