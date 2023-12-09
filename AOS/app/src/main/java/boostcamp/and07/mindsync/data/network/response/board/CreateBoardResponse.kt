package boostcamp.and07.mindsync.data.network.response.board

import kotlinx.serialization.Serializable

@Serializable
data class CreateBoardResponse(
    val message: String,
    val statusCode: Int,
    val data: CreateBoardData?,
)

@Serializable
data class CreateBoardData(
    val boardId: String,
    val date: String,
    val imageUrl: String,
)
