package boostcamp.and07.mindsync.ui.boardlist

import android.util.Log
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
        private val _boards = MutableStateFlow<List<Board>>(listOf())
        val boards: StateFlow<List<Board>> = _boards
        private val _selectBoards = MutableStateFlow<List<Board>>(mutableListOf())
        val selectBoards: StateFlow<List<Board>> = _selectBoards
        private val _uiState = MutableStateFlow(BoardUiState())
        val uiState: StateFlow<BoardUiState> = _uiState
        private val _event = MutableSharedFlow<BoardUiEvent>()
        val event: SharedFlow<BoardUiEvent> = _event

        private val coroutineExceptionHandler =
            CoroutineExceptionHandler { _, throwable ->
                viewModelScope.launch { _event.emit(BoardUiEvent.Error(throwable.message.toString())) }
            }

        init {
            getBoards()
        }

        fun onFloatingButtonClick() {
            if (_selectBoards.value.isEmpty()) {
                addBoard()
            } else {
                deleteBoard()
            }
        }

        private fun addBoard() {
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.createBoard(
                    boardName = "test1",
                    spaceId = "11ee9460b24ce860955db5440e21a467",
                    imageUrl = "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg",
                ).collectLatest { board ->
                    Log.d("Board", "$board")
                    _uiState.update { it ->
                        val list = it.boards.toMutableList()
                        list.add(board)
                        it.copy(boards = list.toList())
                    }
                    _boards.value =
                        _boards.value.toMutableList().apply {
                            add(board)
                        }
                    _event.emit(BoardUiEvent.Success)
                }
            }
        }

        private fun getBoards() {
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.getBoard("11ee9460b24ce860955db5440e21a467").collectLatest { list ->
                    _uiState.update { it ->
                        it.copy(boards = list)
                    }
                    _event.emit(BoardUiEvent.Success)
                }
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
