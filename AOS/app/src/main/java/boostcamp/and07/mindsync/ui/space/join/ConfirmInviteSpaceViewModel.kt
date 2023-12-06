package boostcamp.and07.mindsync.ui.space.join

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject

@HiltViewModel
class ConfirmInviteSpaceViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(SpaceUiState())
        val uiState: StateFlow<SpaceUiState> = _uiState

        fun updateSpace(space: Space) {
            _uiState.update { uiState ->
                uiState.copy(space = space)
            }
        }

        fun joinSpace(space: Space) {
            // Todo Profit_Uuid가 생기면 joinSpace 구현
        }
    }
