package boostcamp.and07.mindsync.data.network.request

import kotlinx.serialization.Serializable

@Serializable
data class NewAccessTokenRequest(
    val accessToken: String,
    val refreshToken: String,
)
