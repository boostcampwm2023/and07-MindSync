package boostcamp.and07.mindsync.data.repository.login

import android.util.Log
import boostcamp.and07.mindsync.data.network.LogoutApi
import boostcamp.and07.mindsync.data.network.request.LogoutRequest
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LogoutEventRepository
    @Inject
    constructor(
        private val tokenRepository: TokenRepository,
        private val api: LogoutApi,
    ) {
        private val _logoutEvent = MutableSharedFlow<LogoutEvent>()
        val logoutEvent = _logoutEvent.asSharedFlow()

        suspend fun logout() {
            Log.d("LogoutEventRepository", "logoutRequest: 성공!!")
            logoutRequest()
            deleteToken()
            _logoutEvent.emit(LogoutEvent.Logout)
        }

        private suspend fun logoutRequest() {
            val refreshToken = tokenRepository.getRefreshToken().first()
            val accessToken = tokenRepository.getRefreshToken().first()
            if (refreshToken != null && accessToken != null) {
                val request = LogoutRequest(refreshToken, accessToken)
                val response = api.postLogout(request)
            }
        }

        private suspend fun deleteToken() {
            tokenRepository.deleteAccessToken()
            tokenRepository.deleteRefreshToken()
        }
    }
