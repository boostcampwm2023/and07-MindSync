package boostcamp.and07.mindsync.ui.space

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.space.SpaceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddInviteSpaceViewModel
    @Inject
    constructor(
        private val spaceRepository: SpaceRepository,
    ) : ViewModel() {
        private val _spaceInviteCode = MutableStateFlow("")
        val spaceInviteCode: StateFlow<String> = _spaceInviteCode

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
                val response = spaceRepository.getSpace(_spaceInviteCode.value)
                response.onSuccess {
                }.onFailure {
                }
            }
        }
    }
