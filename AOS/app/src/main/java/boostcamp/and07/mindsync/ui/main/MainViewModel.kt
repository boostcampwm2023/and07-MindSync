package boostcamp.and07.mindsync.ui.main

import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import boostcamp.and07.mindsync.data.repository.profilespace.ProfileSpaceRepository
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
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
class MainViewModel
    @Inject
    constructor(
        private val profileRepository: ProfileRepository,
        private val profileSpaceRepository: ProfileSpaceRepository,
        private val logoutEventRepository: LogoutEventRepository,
    ) : BaseActivityViewModel(logoutEventRepository) {
        private val _uiState = MutableStateFlow(MainUiState())
        val uiState: StateFlow<MainUiState> = _uiState
        private val _event = MutableSharedFlow<MainUiEvent>()
        val event: SharedFlow<MainUiEvent> = _event

        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(MainUiEvent.ShowMessage(throwable.message.toString())) }
            }

        fun fetchProfile() {
            viewModelScope.launch(coroutineExceptionHandler) {
                profileRepository.getProfile().collectLatest { profile ->
                    _uiState.update { uiState ->
                        uiState.copy(
                            profileImageUrl = profile.imageUrl,
                        )
                    }
                }
            }
        }

        fun getSpaces() {
            viewModelScope.launch(coroutineExceptionHandler) {
                profileSpaceRepository.getSpaces().collectLatest { responseSpaces ->
                    val newSpaces =
                        responseSpaces.map { space ->
                            if (space.id == _uiState.value.nowSpace?.id) {
                                space.copy(isSelected = true)
                            } else {
                                space
                            }
                        }
                    _uiState.update { uiState ->
                        uiState.copy(
                            spaces = newSpaces,
                        )
                    }
                }
            }
        }

        fun updateCurrentSpace(space: Space) {
            val updatedSpaces = _uiState.value.spaces.map { it.copy(isSelected = it == space) }
            _uiState.update { uiState ->
                uiState.copy(
                    nowSpace = space,
                    spaces = updatedSpaces,
                )
            }
            viewModelScope.launch {
                _event.emit(MainUiEvent.ShowMessage("${space.name}방에 참가했습니다."))
                getSpaceUsers()
            }
        }

        fun getSpaceUsers() {
            uiState.value.nowSpace?.let { nowSpace ->
                viewModelScope.launch(coroutineExceptionHandler) {
                    profileSpaceRepository.getSpaceUsers(nowSpace.id).collectLatest { list ->
                        _uiState.update { uiState ->
                            uiState.copy(
                                users = list,
                            )
                        }
                    }
                }
            }
        }

        fun leaveSpace() {
            uiState.value.nowSpace?.let { nowSpace ->
                viewModelScope.launch(coroutineExceptionHandler) {
                    profileSpaceRepository.leaveSpace(nowSpace.id).collectLatest {
                        _uiState.update { mainUiState ->
                            mainUiState.copy(
                                spaces = mainUiState.spaces.filter { space -> space.id != nowSpace.id },
                                nowSpace = null,
                                users = listOf(),
                            )
                        }
                        _event.emit(MainUiEvent.LeaveSpace(nowSpace.name))
                    }
                }
            }
        }
    }
