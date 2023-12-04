package boostcamp.and07.mindsync.data.network.request

import kotlinx.serialization.Serializable

@Serializable
data class KakaoLoginRequest(
    val kakaoUserId: String,
)
