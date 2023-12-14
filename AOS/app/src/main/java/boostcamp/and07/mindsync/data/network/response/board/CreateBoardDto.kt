package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class CreateBoardDto(
    val boardId: String,
    val date: String,
    val imageUrl: String,
)
