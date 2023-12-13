package boostcamp.and07.mindsync.ui.recyclebin

import boostcamp.and07.mindsync.data.model.Board

interface RecycleBinClickListener {
    fun onCheckBoxClick(board: Board)
}