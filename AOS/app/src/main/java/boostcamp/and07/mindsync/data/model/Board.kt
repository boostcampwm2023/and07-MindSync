package boostcamp.and07.mindsync.data.model

data class Board(
    val id: String,
    val name: String,
    val date: String,
    val imageUrl: String,
    var isChecked: Boolean = false,
)
