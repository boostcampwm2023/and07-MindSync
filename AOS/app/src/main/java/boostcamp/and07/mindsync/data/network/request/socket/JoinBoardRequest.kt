package boostcamp.and07.mindsync.data.network.request.socket

import kotlinx.serialization.Serializable

@Serializable
data class JoinBoardRequest(
    val boardId: String,
    val boardName: String,
)
