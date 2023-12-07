package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class CreateBoardResponse(
    val boardId: String,
    val date: String,
)
