package boostcamp.and07.mindsync.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel
    @Inject
    constructor(
        private val profileRepository: ProfileRepository,
    ) : ViewModel() {
        private val _profileImageUrl = MutableStateFlow("")
        val profileImageUrl: StateFlow<String> = _profileImageUrl
        private val _event = MutableSharedFlow<MainUiEvent>()
        val event: SharedFlow<MainUiEvent> = _event
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(MainUiEvent.ShowMessage(throwable.message.toString())) }
            }

        fun fetchProfile() {
            viewModelScope.launch(coroutineExceptionHandler) {
                profileRepository.getProfile().collectLatest { profile ->
                    _profileImageUrl.value = profile.imageUrl
                }
            }
        }
    }
