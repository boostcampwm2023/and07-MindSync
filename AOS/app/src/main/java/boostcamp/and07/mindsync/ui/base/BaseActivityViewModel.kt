package boostcamp.and07.mindsync.ui.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
open class BaseActivityViewModel
    @Inject
    constructor(
        private val logoutEventRepository: LogoutEventRepository,
    ) : ViewModel() {
        private val _events = MutableSharedFlow<ViewEvent>()
        val events: SharedFlow<ViewEvent> = _events.asSharedFlow()

        private fun sendLogoutEvent() {
            viewModelScope.launch {
                logoutEventRepository.logout().collect { logoutEvent ->
                    if (logoutEvent) {
                        _events.emit(ViewEvent.Logout)
                    }
                }
            }
        }

        fun logout() {
            viewModelScope.launch {
                logoutEventRepository.logout()
            }
        }
    }
