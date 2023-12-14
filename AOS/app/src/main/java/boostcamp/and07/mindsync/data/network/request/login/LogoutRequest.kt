package boostcamp.and07.mindsync.data.network.request.login

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LogoutRequest(
    @SerialName("refresh_token")
    val refreshToken: String,
    @SerialName("access_token")
    val accessToken: String,
)
