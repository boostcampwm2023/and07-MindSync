package boostcamp.and07.mindsync.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
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

        fun fetchProfile() {
            viewModelScope.launch {
                profileRepository.getProfile()
                    .onSuccess { profile ->
                        _profileImageUrl.value = profile.imageUrl
                    }
                    .onFailure {
                        _event.emit(MainUiEvent.ShowMessage(it.message.toString()))
                    }
            }
        }
    }
