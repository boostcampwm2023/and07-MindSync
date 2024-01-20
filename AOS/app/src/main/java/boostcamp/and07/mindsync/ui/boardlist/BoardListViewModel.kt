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
                viewModelScope.launch {
                    _boardUiEvent.emit(BoardUiEvent.ShowMessage(throwable.message.toString()))
                }
            }

        fun setSpaceId(spaceId: String) {
            _boardUiState.update { boardUiState ->
                boardUiState.copy(spaceId = spaceId)
            }
            getBoards()
        }

        fun addBoard(
            imageFile: MultipartBody.Part?,
            name: String,
        ) {
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.createBoard(
                    boardName = name,
                    spaceId = _boardUiState.value.spaceId,
                    imageUrl = imageFile,
                ).collectLatest { board ->
                    _boardUiState.update { boardUiState ->
                        val newBoards = boardUiState.boards.toMutableList().apply { add(board) }
                        boardUiState.copy(boards = newBoards)
                    }
                }
            }
        }

        fun getBoards() {
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.getBoard(_boardUiState.value.spaceId, false)
                    .collectLatest { boards ->
                        _boardUiState.update { boardUiState ->
                            boardUiState.copy(boards = boards)
                        }
                    }
            }
        }

        fun selectBoard(selectBoard: Board) {
            _boardUiState.update { boardUiState ->
                val newSelectBoards =
                    boardUiState.boards.toMutableList().filter { board -> board.isChecked }
                boardUiState.copy(
                    selectBoards = newSelectBoards,
                )
            }
        }

        fun deleteBoard() {
            viewModelScope.launch(coroutineExceptionHandler) {
                val newBoards = boardUiState.value.boards.toMutableList()
                val newSelectBoards = boardUiState.value.selectBoards.toMutableList()
                _boardUiState.value.selectBoards.map { board ->
                    boardListRepository.deleteBoard(board.id).collectLatest {
                        newBoards.remove(board)
                        newSelectBoards.remove(board)
                    }
                }
                _boardUiState.update { boardUiState ->
                    boardUiState.copy(
                        boards = newBoards,
                        selectBoards = newSelectBoards,
                    )
                }
            }
        }

        fun restoreBoard() {
            viewModelScope.launch(coroutineExceptionHandler) {
                val newBoards = boardUiState.value.boards.toMutableList()
                val newSelectBoards = boardUiState.value.selectBoards.toMutableList()
                _boardUiState.value.selectBoards.map { board ->
                    boardListRepository.restoreBoard(board.id).collectLatest {
                        newBoards.remove(board)
                        newSelectBoards.remove(board)
                    }
                }
                _boardUiState.update { boardUiState ->
                    boardUiState.copy(
                        boards = newBoards,
                        selectBoards = newSelectBoards,
                    )
                }
            }
        }
    }
