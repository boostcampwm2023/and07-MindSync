package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NewAccessTokenResponse(
    val statusCode: Int,
    val message: String,
    val error: String?,
    val data: NewAccessTokenData?,
)

@Serializable
data class NewAccessTokenData(
    @SerialName("access_token")
    val accessToken: String,
)
