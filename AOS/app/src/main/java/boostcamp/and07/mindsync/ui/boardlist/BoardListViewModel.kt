package boostcamp.and07.mindsync.ui.boardlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.data.repository.boardlist.BoardListRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BoardListViewModel
@Inject
constructor(
    private val boardListRepository: BoardListRepository,
) : ViewModel() {
    private val _boardUiState = MutableStateFlow(BoardUiState())
    val boardUiState: StateFlow<BoardUiState> = _boardUiState
    private val _boardUiEvent = MutableSharedFlow<BoardUiEvent>()
    val boardUiEvent: SharedFlow<BoardUiEvent> = _boardUiEvent

    private val coroutineExceptionHandler =
        CoroutineExceptionHandler { _, throwable ->
            viewModelScope.launch { _boardUiEvent.emit(BoardUiEvent.Error(throwable.message.toString())) }
        }

    init {
        getBoards()
    }

    fun onFloatingButtonClick() {
        if (_boardUiState.value.selectBoards.isEmpty()) {
            addBoard()
        } else {
            deleteBoard()
        }
    }

    private fun addBoard() {
        viewModelScope.launch(coroutineExceptionHandler) {
            boardListRepository.createBoard(
                boardName = "test1",
                spaceId = testSpaceId,
                imageUrl = testImageUrl,
            ).collectLatest { board ->
                _boardUiState.update { it ->
                    val list = it.boards.toMutableList()
                    list.add(board)
                    it.copy(boards = list.toList())
                }
                val newBoards = _boardUiState.value.boards.toMutableList().apply { add(board) }
                _boardUiState.value = _boardUiState.value.copy(boards = newBoards)
                _boardUiEvent.emit(BoardUiEvent.Success)
            }
        }
    }

    private fun getBoards() {
        viewModelScope.launch(coroutineExceptionHandler) {
            boardListRepository.getBoard(testSpaceId).collectLatest { list ->
                _boardUiState.update { it ->
                    it.copy(boards = list)
                }
                _boardUiEvent.emit(BoardUiEvent.Success)
            }
        }
    }

    fun selectBoard(selectBoard: Board) {
        val newSelectBoards =
            _boardUiState.value.boards.toMutableList().filter { board -> board.isChecked }
        _boardUiState.value =
            _boardUiState.value.copy(
                selectBoards = newSelectBoards
            )
    }

    private fun deleteBoard() {
        val newBoards =
            _boardUiState.value.boards.toMutableList().filter { board -> !board.isChecked }
        _boardUiState.value =
            _boardUiState.value.copy(
                boards = newBoards,
                selectBoards = listOf()
            )
    }

    companion object {
        private const val testSpaceId = "11ee94cb588902308d61176844e12449"
        private const val testImageUrl =
            "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg"
    }

}
