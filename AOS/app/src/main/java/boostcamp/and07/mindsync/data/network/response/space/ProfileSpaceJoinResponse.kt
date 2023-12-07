package boostcamp.and07.mindsync.data.network.response.space

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProfileSpaceJoinResponse(
    val statusCode: Int,
    val message: String,
    val data: ProfileSpaceJoinData?,
)

@Serializable
data class ProfileSpaceJoinData(
    @SerialName("space_uuid")
    val spaceId: String,
    @SerialName("profile_uuid")
    val profileId: String,
)
