package boostcamp.and07.mindsync.data.network.response.space

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class InviteCodeResponse(
    val statusCode: Int,
    val message: String,
    val data: InviteCodeData?,
)

@Serializable
data class InviteCodeData(
    @SerialName("invite_code")
    val inviteCode: String,
)
