package boostcamp.and07.mindsync.data.network

import android.util.Log
import boostcamp.and07.mindsync.BuildConfig
import boostcamp.and07.mindsync.data.network.request.JoinBoard
import boostcamp.and07.mindsync.data.network.request.UpdateMindMap
import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedCrdtTree
import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedOperation
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.URISyntaxException

class MindMapSocketManager {
    private val socket = IO.socket(BASE_URL + BOARD_NAME_SPACE)

    init {
        connectWebSocket()
    }

    fun listenState(): Flow<SocketState> =
        callbackFlow {
            socket.on(Socket.EVENT_DISCONNECT) {
                trySend(SocketState.DISCONNECT)
            }.on(Socket.EVENT_CONNECT) {
                trySend(SocketState.CONNECT)
            }.on(Socket.EVENT_CONNECT_ERROR) {
                trySend(SocketState.ERROR)
            }
            awaitClose { cancel() }
        }

    fun listenEvent(): Flow<SocketEvent> =
        callbackFlow {
            socket.on(EVENT_OPERATION_FROM_SERVER) { args ->
                val serializedOperation = args[0].toString()
                val objectSerializedOperation =
                    Json.decodeFromString<SerializedOperation>(serializedOperation)
                trySend(
                    SocketEvent(
                        SocketEventType.OPERATION_FROM_SERVER,
                        objectSerializedOperation,
                    ),
                )
            }.on(EVENT_INIT_TREE) { args ->
                val serializedCrdtTree = args[0].toString()
                val objectSerializedCrdtTree =
                    Json.decodeFromString<SerializedCrdtTree>(serializedCrdtTree)
                trySend(
                    SocketEvent(
                        SocketEventType.OPERATION_FROM_SERVER,
                        objectSerializedCrdtTree,
                    ),
                )
            }
            awaitClose { cancel() }
        }

    private fun connectWebSocket() {
        try {
            socket.connect()
        } catch (e: URISyntaxException) {
            Log.e("MindMapBoardWebSocket", "Error: ${e.message}")
        }
    }

    fun joinBoard(boardId: String) {
        socket.emit(EVENT_JOIN_BOARD, Json.encodeToString(JoinBoard(boardId)))
    }

    fun updateMindMap(
        serializedOperation: SerializedOperation,
        boardId: String,
    ) {
        socket.emit(
            EVENT_UPDATE_MIND_MAP,
            Json.encodeToString(UpdateMindMap(serializedOperation, boardId)),
        )
    }

    fun closeConnection() {
        socket.disconnect()
    }

    companion object {
        const val BASE_URL = BuildConfig.BASE_URL
        const val BOARD_NAME_SPACE = "board"
        const val EVENT_OPERATION_FROM_SERVER = "operationFromServer"
        const val EVENT_UPDATE_MIND_MAP = "updateMindmap"
        const val EVENT_JOIN_BOARD = "joinBoard"
        const val EVENT_INIT_TREE = "initTree"
    }
}

enum class SocketState {
    DISCONNECT,
    CONNECT,
    ERROR,
}

data class SocketEvent(
    val eventType: SocketEventType,
    val operation: Any,
)

enum class SocketEventType {
    OPERATION_FROM_SERVER,
}
