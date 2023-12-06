package boostcamp.and07.mindsync.ui.space.join

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import boostcamp.and07.mindsync.ui.space.SpaceEvent
import boostcamp.and07.mindsync.ui.util.SpaceExceptionMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class InputSpaceCodeViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _spaceInviteCode = MutableStateFlow("")
        val spaceInviteCode: StateFlow<String> = _spaceInviteCode
        private val _spaceEvent = MutableSharedFlow<SpaceEvent>()
        val spaceEvent = _spaceEvent.asSharedFlow()

        fun onSpaceInviteCodeChanged(
            inviteSpaceCode: CharSequence,
            start: Int,
            before: Int,
            count: Int,
        ) {
            _spaceInviteCode.value = inviteSpaceCode.toString()
        }

        fun compareInviteCode() {
            viewModelScope.launch {
                spaceRepository.getSpace(_spaceInviteCode.value)
                    .onSuccess { getSpace ->
                        _spaceEvent.emit(SpaceEvent.GetSuccess(getSpace))
                    }
                    .onFailure {
                        _spaceEvent.emit(SpaceEvent.Error(SpaceExceptionMessage.ERROR_MESSAGE_SPACE_GET.message))
                    }
            }
        }
    }
