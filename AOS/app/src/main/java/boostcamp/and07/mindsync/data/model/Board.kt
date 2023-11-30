package boostcamp.and07.mindsync.data.model

import java.time.LocalDate

data class Board(
    val id: String,
    val name: String,
    val date: LocalDate,
    val imageUrl: String,
    var isChecked:Boolean = false
)
