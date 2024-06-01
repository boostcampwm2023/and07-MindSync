package boostcamp.and07.mindsync.ui.space.list

import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.network.NetworkManager
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepository
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import boostcamp.and07.mindsync.ui.space.SpaceUiEvent
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
        logoutEventRepository: LogoutEventRepository,
        networkManager: NetworkManager,
    ) : BaseActivityViewModel(logoutEventRepository, networkManager) {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState
        private val _uiEvent = MutableSharedFlow<SpaceUiEvent>()
        val uiEvent: SharedFlow<SpaceUiEvent> = _uiEvent
        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _uiEvent.emit(SpaceUiEvent.ShowMessage(throwable.message.toString())) }
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
