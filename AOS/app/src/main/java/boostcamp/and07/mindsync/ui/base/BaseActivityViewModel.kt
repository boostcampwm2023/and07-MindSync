package boostcamp.and07.mindsync.ui.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.network.NetworkManager
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
open class BaseActivityViewModel
@Inject
constructor(
    private val logoutEventRepository: LogoutEventRepository,
    private val networkManager: NetworkManager,
) : ViewModel() {
    private val _events = MutableSharedFlow<ViewEvent>()
    val events: SharedFlow<ViewEvent> = _events.asSharedFlow()
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected

    init {
        networkManager.registerNetworkCallback()
        observerNetworkConnection()
    }

    private fun sendLogoutEvent() {
        viewModelScope.launch {
            logoutEventRepository.logout().collect { logoutEvent ->
                if (logoutEvent) {
                    _events.emit(ViewEvent.Logout)
                }
            }
        }
    }

    private fun observerNetworkConnection() {
        viewModelScope.launch {
            networkManager.isConnected.collectLatest { isConnected ->
                _isConnected.update { isConnected }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            logoutEventRepository.logout()
        }
    }

    override fun onCleared() {
        super.onCleared()
        networkManager.unRegisterNetworkCallback()
    }
}
