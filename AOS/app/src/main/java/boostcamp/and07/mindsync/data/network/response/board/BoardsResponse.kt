package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class BoardsResponse(
    val statusCode: Int,
    val message: String,
    val data: List<BoardDto>,
)
