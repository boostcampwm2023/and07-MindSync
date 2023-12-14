package boostcamp.and07.mindsync.data.network.response.mindmap

import boostcamp.and07.mindsync.data.crdt.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SerializedCrdtTree(
    @SerialName("clock")
    val clock: Clock,
    @SerialName("operationLogs")
    val operationLogs: List<SerializedOperationLog>?,
    @SerialName("tree")
    val tree: SerializedTree,
)
