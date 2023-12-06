package boostcamp.and07.mindsync.data.network.request.space

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class InviteCodeRequest(
    @SerialName("space_uuid")
    val spaceId: String,
)
