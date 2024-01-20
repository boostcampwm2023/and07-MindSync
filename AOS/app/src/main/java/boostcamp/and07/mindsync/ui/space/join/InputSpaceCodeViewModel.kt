package boostcamp.and07.mindsync.ui.space.join

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import boostcamp.and07.mindsync.ui.util.SpaceExceptionMessage
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
class InputSpaceCodeViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private val _event = MutableSharedFlow<SpaceUiEvent>()
        val event = _event.asSharedFlow()
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch {
                    _event.emit(
                        SpaceUiEvent.ShowMessage(SpaceExceptionMessage.ERROR_MESSAGE_SPACE_INVITE_CODE_WRONG.message),
                    )
                }
            }

        fun onSpaceInviteCodeChanged(
            inviteSpaceCode: CharSequence,
            start: Int,
            before: Int,
            count: Int,
        ) {
            _uiState.update { uiState ->
                uiState.copy(
                    spaceInviteCode = inviteSpaceCode.toString(),
                )
            }
        }

        fun compareInviteCode() {
            viewModelScope.launch(coroutineExceptionHandler) {
                spaceRepository.joinInviteCode(_uiState.value.spaceInviteCode).collectLatest { space ->
                    _event.emit(SpaceUiEvent.NavigationToConfirmSpace(space))
                }
            }
        }
    }
