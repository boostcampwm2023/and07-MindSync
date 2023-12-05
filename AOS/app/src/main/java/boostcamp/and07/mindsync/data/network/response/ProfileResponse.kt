package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.Serializable

@Serializable
data class ProfileResponse(
    val uuid: String,
    val nickname: String? = null,
    val image: String? = null,
)
