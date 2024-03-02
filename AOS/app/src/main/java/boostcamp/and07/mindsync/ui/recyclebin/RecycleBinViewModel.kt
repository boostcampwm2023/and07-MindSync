package boostcamp.and07.mindsync.ui.recyclebin

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
class RecycleBinViewModel
    @Inject
    constructor(
        private val boardListRepository: BoardListRepository,
    ) : ViewModel() {
        private val _uiState = MutableStateFlow(RecycleBinUiState())
        val uiState: StateFlow<RecycleBinUiState> = _uiState
        private val _uiEvent = MutableSharedFlow<RecycleBinUiEvent>()
        val uiEvent: SharedFlow<RecycleBinUiEvent> = _uiEvent

        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch {
                    _uiEvent.emit(RecycleBinUiEvent.ShowMessage(throwable.message.toString()))
                }
            }

        fun setSpace(spaceId: String) {
            _uiState.update { boardUiState ->
                boardUiState.copy(
                    spaceId = spaceId,
                )
            }
            getBoards()
        }

        fun getBoards() {
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.getBoard(_uiState.value.spaceId, true).collectLatest { boards ->
                    _uiState.update { boardUiState ->
                        boardUiState.copy(boards = boards)
                    }
                }
            }
        }

        fun selectBoard(selectBoard: Board) {
            _uiState.update { boardUiState ->
                val newSelectBoards =
                    boardUiState.boards.toMutableList().filter { board -> board.isChecked }
                boardUiState.copy(
                    selectBoards = newSelectBoards,
                )
            }
        }

        fun restoreBoard() {
            viewModelScope.launch(coroutineExceptionHandler) {
                val newBoards = uiState.value.boards.toMutableList()
                val newSelectBoards = uiState.value.selectBoards.toMutableList()
                _uiState.value.selectBoards.map { board ->
                    boardListRepository.restoreBoard(board.id).collectLatest {
                        newBoards.remove(board)
                        newSelectBoards.remove(board)
                    }
                }
                _uiState.update { boardUiState ->
                    boardUiState.copy(
                        boards = newBoards,
                        selectBoards = newSelectBoards,
                    )
                }
            }
        }
    }
