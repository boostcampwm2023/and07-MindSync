package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class DeleteBoardResponse(
    val statusCode: String,
    val message: String,
    val error: String? = null,
)
