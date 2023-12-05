package boostcamp.and07.mindsync.data.repository.login

import android.util.Log
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LogoutEventRepository
    @Inject
    constructor(
        private val tokenRepository: TokenRepository,
    ) {
        private val _logoutEvent = MutableSharedFlow<LogoutEvent>()
        val logoutEvent = _logoutEvent.asSharedFlow()

        suspend fun logoutRequest() {
            Log.d("LogoutEventRepository", "logoutRequest: 성공!!")
            _logoutEvent.emit(LogoutEvent.Logout)
            tokenRepository.deleteAccessToken()
            tokenRepository.deleteRefreshToken()
        }
    }

sealed interface LogoutEvent {
    data object Logout : LogoutEvent
}
