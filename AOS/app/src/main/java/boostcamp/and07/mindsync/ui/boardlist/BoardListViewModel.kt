package boostcamp.and07.mindsync.ui.boardlist

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.boardlist.BoardListRepository
import boostcamp.and07.mindsync.ui.util.fileToMultiPart
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class BoardListViewModel
    @Inject
    constructor(
        private val savedStateHandle: SavedStateHandle,
        private val boardListRepository: BoardListRepository,
    ) : ViewModel() {
        private val _boardUiState = MutableStateFlow(BoardListUiState())
        val boardUiState: StateFlow<BoardListUiState> = _boardUiState
        private val _boardUiEvent = MutableSharedFlow<BoardListUiEvent>()
        val boardUiEvent: SharedFlow<BoardListUiEvent> = _boardUiEvent
        private lateinit var coroutineExceptionHandler: CoroutineExceptionHandler

        init {
            setCoroutineExceptionHandler()
            setSpaceId()
        }

        private fun setCoroutineExceptionHandler() {
            coroutineExceptionHandler =
                CoroutineExceptionHandler { _, throwable ->
                    viewModelScope.launch {
                        _boardUiEvent.emit(BoardListUiEvent.ShowMessage(throwable.message.toString()))
                    }
                }
        }

        private fun setSpaceId() {
            val spaceId = savedStateHandle.get<String>("spaceId").orEmpty()
            spaceId?.let {
                _boardUiState.update { boardUiState ->
                    boardUiState.copy(spaceId = spaceId)
                }
                getBoards()
            }
        }

        fun addBoard(
            imageFile: File?,
            name: String,
        ) {
            val imageUrl =
                imageFile?.let {
                    fileToMultiPart(imageFile, "image")
                }
            viewModelScope.launch(coroutineExceptionHandler) {
                boardListRepository.createBoard(
                    boardName = name,
                    spaceId = _boardUiState.value.spaceId,
                    imageUrl = imageUrl,
                ).collectLatest { board ->
                    _boardUiState.update { boardUiState ->
                        val newBoards = boardUiState.boards.toMutableList().apply { add(board) }
                        boardUiState.copy(boards = newBoards)
                    }
                }
            }
        }

        fun showCreateBoardDialog(isShown: Boolean) {
            _boardUiState.update { uiState ->
                uiState.copy(
                    isShownDialog = isShown,
                    boardName = "",
                    boardImage = "",
                    boardThumbnailFile = null,
                )
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

        fun selectBoard() {
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
                _boardUiState.value.boards.filter { board ->
                    board.isChecked
                }.map { board ->
                    boardListRepository.deleteBoard(board.id).collectLatest {
                        newBoards.remove(board)
                    }
                }
                _boardUiState.update { boardUiState ->
                    boardUiState.copy(
                        boards = newBoards,
                        selectBoards = listOf(),
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

        fun onBoardNameChanged(inputSpaceName: CharSequence) {
            _boardUiState.update { uiState ->
                uiState.copy(boardName = inputSpaceName.toString())
            }
        }

        fun setBoardImage(boardImage: String) {
            _boardUiState.update { uiState ->
                uiState.copy(boardImage = boardImage)
            }
        }

        fun setImageFile(file: File) {
            _boardUiState.update { uiState ->
                uiState.copy(boardThumbnailFile = file)
            }
        }
    }
