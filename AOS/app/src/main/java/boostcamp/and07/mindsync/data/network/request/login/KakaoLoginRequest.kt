package boostcamp.and07.mindsync.data.network.request.login

import kotlinx.serialization.Serializable

@Serializable
data class KakaoLoginRequest(
    val kakaoUserId: Long,
)
