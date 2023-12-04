package boostcamp.and07.mindsync.data.repository.login

interface LoginRepository {
    suspend fun loginWithKakao(kakaoUserId: String): Result<String>
}
