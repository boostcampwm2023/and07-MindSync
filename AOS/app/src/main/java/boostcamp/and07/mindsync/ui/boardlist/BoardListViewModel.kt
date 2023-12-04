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
    private val _selectBoards = MutableStateFlow<List<Board>>(mutableListOf())
    val selectBoards: StateFlow<List<Board>> = _selectBoards

    fun onFloatingButtonClick() {
        if (_selectBoards.value.isEmpty()) {
            addBoard()
        } else {
            deleteBoard()
        }
    }

    private fun addBoard() {
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

    fun selectBoard(selectBoard: Board) {
        val currentSelectBoards = _selectBoards.value.find { board -> board == selectBoard }
        if (currentSelectBoards == null) {
            _selectBoards.value =
                _selectBoards.value.toMutableList().apply {
                    add(selectBoard)
                }
        } else {
            _selectBoards.value =
                _selectBoards.value.toMutableList().apply {
                    remove(selectBoard)
                }
        }
    }

    private fun deleteBoard() {
        _boards.value =
            _boards.value.toMutableList().apply {
                removeAll(_selectBoards.value)
            }
        _selectBoards.value = listOf()
    }
}
