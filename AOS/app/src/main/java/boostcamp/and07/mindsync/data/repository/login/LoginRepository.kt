package boostcamp.and07.mindsync.data.repository.login

import boostcamp.and07.mindsync.data.network.response.LoginResponse

interface LoginRepository {
    suspend fun loginWithKakao(kakaoUserId: Long): Result<LoginResponse>
}
