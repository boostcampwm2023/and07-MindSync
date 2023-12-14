package boostcamp.and07.mindsync.data.network.response.login

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NewAccessTokenDto(
    @SerialName("access_token")
    val accessToken: String,
)

