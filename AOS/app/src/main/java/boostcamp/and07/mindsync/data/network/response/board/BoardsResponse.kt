package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class BoardsResponse(
    val statusCode: Int,
    val message: String,
    val data: List<BoardsData>,
)

@Serializable
data class BoardsData(
    val boardId: String,
    val boardName: String,
    val createdAt: String,
    val imageUrl: String,
    val isDeleted: Boolean,
)
