package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class BoardDto(
    val boardId: String,
    val boardName: String,
    val createdAt: String,
    val imageUrl: String,
    val isDeleted: Boolean,
)
