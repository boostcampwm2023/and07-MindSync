package boostcamp.and07.mindsync.data.network.request

import kotlinx.serialization.Serializable

@Serializable
data class JoinBoard(
    val boardId: String,
    val boardName: String,
)
