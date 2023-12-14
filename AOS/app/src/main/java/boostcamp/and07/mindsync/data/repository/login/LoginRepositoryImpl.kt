package boostcamp.and07.mindsync.data.repository.login

import boostcamp.and07.mindsync.data.network.api.LoginApi
import boostcamp.and07.mindsync.data.network.request.login.KakaoLoginRequest
import boostcamp.and07.mindsync.data.network.response.login.LoginDto
import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import javax.inject.Inject

class LoginRepositoryImpl
    @Inject
    constructor(private val api: LoginApi) : LoginRepository {
        override suspend fun loginWithKakao(kakaoUserId: Long): Result<LoginDto> {
            return try {
                val request = KakaoLoginRequest(kakaoUserId)
                val response = api.postKakaoOAuth(request)
                if (response.isSuccessful) {
                    response.body()?.let { loginResponse ->
                        loginResponse.data?.let { loginData ->
                            Result.success(loginData)
                        }
                            ?: Result.failure(Throwable(NetworkExceptionMessage.ERROR_MESSAGE_KAKAO_RESULT_NULL.message))
                    }
                        ?: Result.failure(Throwable(NetworkExceptionMessage.ERROR_MESSAGE_KAKAO_RESULT_NULL.message))
                } else {
                    Result.failure(
                        Throwable(response.code().toString()),
                    )
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
