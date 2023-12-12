package boostcamp.and07.mindsync.data.network.response.mindmap

import boostcamp.and07.mindsync.data.crdt.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SerializedCrdtTree(
    @SerialName("clock")
    val clock: Clock,
    @SerialName("operationLogs")
    val operationLogs: List<OperationLog>?,
    @SerialName("tree")
    val tree: SerializedTree,
)

@Serializable
data class OperationLog(
    val operation: SerializedOperation,
    val oldDescription: String? = null,
    val oldParentId: String? = null,
)

@Serializable
data class SerializedOperation(
    val operationType: String,
    val id: String,
    val clock: Clock,
    val description: String? = null,
    val parentId: String? = null,
)

@Serializable
data class SerializedTree(
    @SerialName("nodes")
    val nodes: List<NodeDto>,
)

@Serializable
data class NodeDto(
    @SerialName("children")
    val children: List<String>?,
    @SerialName("targetId")
    val targetId: String?,
    @SerialName("parentId")
    val parentId: String?,
    @SerialName("description")
    val description: String?,
)
