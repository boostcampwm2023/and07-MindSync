package boostcamp.and07.mindsync.ui.boardlist

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.IdGenerator
import boostcamp.and07.mindsync.data.model.Board
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.time.LocalDate

class BoardListViewModel : ViewModel() {
    private val _boards = MutableStateFlow<List<Board>>(listOf())
    val boards: StateFlow<List<Board>> = _boards

    fun addBoard() {
        val board =
            Board(
                IdGenerator.makeRandomNodeId(),
                "test1",
                LocalDate.now(),
                "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg",
            )
        _boards.value =
            _boards.value.toMutableList().apply {
                add(board)
            }
    }
}
