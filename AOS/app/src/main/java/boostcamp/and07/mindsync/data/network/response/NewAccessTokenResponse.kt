package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.Serializable

@Serializable
data class NewAccessTokenResponse(
    val accessToken: String,
)
