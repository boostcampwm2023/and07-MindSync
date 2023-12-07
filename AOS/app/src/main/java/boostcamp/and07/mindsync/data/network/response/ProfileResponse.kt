package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProfileResponse(
    @SerialName("uuid") val uuid: String,
    @SerialName("nickname") val nickname: String?,
    @SerialName(
        "image",
    ) val image: String? = null,
    @SerialName("user_id") val userId: String? = null,
)
