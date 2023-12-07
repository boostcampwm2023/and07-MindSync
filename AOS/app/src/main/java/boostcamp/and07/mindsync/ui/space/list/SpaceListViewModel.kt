package boostcamp.and07.mindsync.ui.space.list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepository
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceEvent
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SpaceListViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
        private val profileSpaceRepository: ProfileSpaceRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private val _event = MutableSharedFlow<SpaceEvent>()
        val event: SharedFlow<SpaceEvent> = _event
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(SpaceEvent.Error(throwable.message.toString())) }
            }

        fun getSpaces() {
            viewModelScope.launch(coroutineExceptionHandler) {
                profileSpaceRepository.getSpaces().collectLatest { spaces ->
                    _uiState.update { uiState ->
                        uiState.copy(
                            spaces = spaces,
                        )
                    }
                }
            }
        }
    }
