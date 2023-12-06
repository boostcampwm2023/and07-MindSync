package boostcamp.and07.mindsync.data.network.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LogoutRequest(
    @SerialName("refresh_token")
    val refreshToken: String,
)
