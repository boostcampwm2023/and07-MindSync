package boostcamp.and07.mindsync.ui.util

enum class ExceptionMessage(val message: String) {
    ERROR_MESSAGE_INVALID_NODE_ID("Node Id is invalid"),
    ERROR_MESSAGE_DUPLICATED_NODE("Target node is duplicated"),
    ERROR_MESSAGE_TARGET_NODE_NOT_EXIST("Target Node is not exist"),
    ERROR_MESSAGE_PARENT_NODE_NOT_EXIST("Parent Node is not exist"),
    ERROR_MESSAGE_ROOT_NODE_NOT_EXIST("Root Node is not exist"),
    ERROR_MESSAGE_ROOT_CANT_REMOVE("Root can't remove"),
    ERROR_MESSAGE_NOT_DEFINED_OPERATION("Operation is not defined"),
}

enum class NetworkExceptionMessage(val message: String) {
    ERROR_MESSAGE_KAKAO_FAIL("Kakao Login result is null"),
    ERROR_MESSAGE_CANT_GET_TOKEN("Can't get server access token"),
}
