package boostcamp.and07.mindsync.ui.boardlist

import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentBoardListBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment

class BoardListFragment :
    BaseFragment<FragmentBoardListBinding>(R.layout.fragment_board_list) {
    private val boardListViewModel = BoardListViewModel()
    private val boardListAdapter = BoardListAdapter()

    override fun initView() {
        setBinding()
    }

    private fun setBinding() {
        binding.vm = boardListViewModel
        binding.rvBoardListBoard.adapter = boardListAdapter
        boardListAdapter.setBoardClickListener(
            object : BoardClickListener {
                override fun onClick(board: Board) {
                }

                override fun onLongClick(board: Board) {
                    boardListViewModel.selectBoard(board)
                }
            },
        )
    }
}
