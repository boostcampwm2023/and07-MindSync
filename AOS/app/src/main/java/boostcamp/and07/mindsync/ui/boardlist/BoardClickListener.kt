package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.data.model.Board

interface BoardClickListener {
    fun onClick(board: Board)

    fun onCheckBoxClick(board: Board)
}
