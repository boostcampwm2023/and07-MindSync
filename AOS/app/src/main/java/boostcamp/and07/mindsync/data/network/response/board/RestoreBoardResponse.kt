package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class RestoreBoardResponse(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
)
