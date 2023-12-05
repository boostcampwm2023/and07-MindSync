package boostcamp.and07.mindsync.data.repository.login

import boostcamp.and07.mindsync.data.network.TokenApi
import boostcamp.and07.mindsync.data.network.request.NewAccessTokenRequest
import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import com.kakao.sdk.common.Constants.AUTHORIZATION
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject

class TokenAuthenticator
    @Inject
    constructor(
        private val tokenRepository: TokenRepository,
        private val tokenApi: TokenApi,
    ) : Authenticator {
        override fun authenticate(
            route: Route?,
            response: Response,
        ): Request? {
            if (response.message == DataStoreConst.REFRESH_TOKEN_EXPIRED) {
                // TODO : Refresh 토큰 만료 => 로그인 화면으로 이동
                response.close()
                return null
            }
            // 무조건 토큰을 받아온 후 진행시키기 위해 runBlocking
            val refreshToken =
                runBlocking {
                    tokenRepository.getRefreshToken().first()
                }
            val accessToken =
                runBlocking {
                    tokenRepository.getRefreshToken().first()
                }

            if (refreshToken == null || accessToken == null) {
                // TODO : Refresh 토큰 만료 => 로그인 화면으로 이동
                response.close()
                return null
            }
            // 무조건 새 토큰을 받아온 후 진행시키기 위해 runBlocking
            runBlocking {
                getNewAccessToken(accessToken, refreshToken)
                    .onSuccess { newAccessToken ->
                        tokenRepository.saveAccessToken(newAccessToken)
                    }
                    .onFailure { e ->
                        throw e
                    }
            }

            return newRequestWithToken(refreshToken, response.request)
        }

        private suspend fun getNewAccessToken(
            accessToken: String,
            refreshToken: String,
        ): Result<String> {
            return try {
                val request = NewAccessTokenRequest(accessToken, refreshToken)
                val response = tokenApi.getNewAccessToken(request)
                if (response.isSuccessful) {
                    response.body()?.let { tokenResponse ->
                        Result.success(tokenResponse.accessToken)
                    }
                        ?: Result.failure(Exception(NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message))
                } else {
                    Result.failure(Exception(NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

        private fun newRequestWithToken(
            accessToken: String,
            request: Request,
        ): Request =
            request.newBuilder()
                .header(AUTHORIZATION, DataStoreConst.BEARER_TOKEN_PREFIX + accessToken)
                .build()
    }
