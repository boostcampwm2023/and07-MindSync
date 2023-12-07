package boostcamp.and07.mindsync.data.repository.login

import android.util.Log
import boostcamp.and07.mindsync.data.network.LogoutApi
import boostcamp.and07.mindsync.data.network.request.LogoutRequest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LogoutEventRepository
    @Inject
    constructor(
        private val tokenRepository: TokenRepository,
        private val api: LogoutApi,
    ) {
        fun logout() =
            flow {
                Log.d("LogoutEventRepository", "logoutRequest: 성공!!")
                logoutRequest()
                deleteToken()
                emit(true)
            }

        private suspend fun logoutRequest() {
            val refreshToken = tokenRepository.getRefreshToken().first()
            val accessToken = tokenRepository.getRefreshToken().first()
            if (refreshToken != null && accessToken != null) {
                val request = LogoutRequest(refreshToken, accessToken)
                val response = api.postLogout(request)
                if (response.isSuccessful) {
                    Log.d("LogoutEventRepository", "logoutRequest: logout success")
                } else {
                    Log.d("LogoutEventRepository", "logoutRequest: logout fail")
                }
            }
        }

        private suspend fun deleteToken() {
            tokenRepository.deleteAccessToken()
            tokenRepository.deleteRefreshToken()
        }
    }
