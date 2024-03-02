package boostcamp.and07.mindsync.ui.space.join

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ConfirmInviteSpaceViewModel
    @Inject
    constructor(
        private val profileSpaceRepository: ProfileSpaceRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private val _event = MutableSharedFlow<SpaceUiEvent>()
        val event = _event.asSharedFlow()
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(SpaceUiEvent.ShowMessage(throwable.message.toString())) }
            }

        fun updateSpace(space: Space) {
            _uiState.update { uiState ->
                uiState.copy(space = space)
            }
        }

        fun joinSpace() {
            uiState.value.space?.let { space ->
                viewModelScope.launch(coroutineExceptionHandler) {
                    profileSpaceRepository.joinSpace(space.id).collectLatest {
                        _event.emit(SpaceUiEvent.JoinSpace)
                    }
                }
            }
        }
    }
