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
import okhttp3.MultipartBody
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

    fun addBoard(
        part: MultipartBody.Part,
        name: String,
    ) {
        viewModelScope.launch(coroutineExceptionHandler) {
            boardListRepository.createBoard(
                boardName = name,
                spaceId = TEST_SPACE_ID,
                imageUrl = TEST_IMAGE_URL,
            ).collectLatest { board ->
                val newBoards = _boardUiState.value.boards.toMutableList().apply { add(board) }
                _boardUiState.value = _boardUiState.value.copy(boards = newBoards)
                _boardUiEvent.emit(BoardUiEvent.Success)
            }
        }
    }

    private fun getBoards() {
        viewModelScope.launch(coroutineExceptionHandler) {
            boardListRepository.getBoard(TEST_SPACE_ID).collectLatest { list ->
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
                selectBoards = newSelectBoards,
            )
    }

    fun deleteBoard() {
        val newBoards =
            _boardUiState.value.boards.toMutableList().filter { board -> !board.isChecked }
        _boardUiState.value =
            _boardUiState.value.copy(
                boards = newBoards,
                selectBoards = listOf(),
            )
    }

    companion object {
        private const val TEST_SPACE_ID = "11ee94cb588902308d61176844e12449"
        private const val TEST_IMAGE_URL =
            "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg"
    }
}
