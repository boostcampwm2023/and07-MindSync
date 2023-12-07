package boostcamp.and07.mindsync.ui.boardlist

import android.util.Log
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentBoardListBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class BoardListFragment :
    BaseFragment<FragmentBoardListBinding>(R.layout.fragment_board_list) {
    private val boardListViewModel: BoardListViewModel by viewModels()
    private val boardListAdapter = BoardListAdapter()

    override fun initView() {
        setBinding()
        collectBoardEvent()
        onFloatingButtonClick()
    }

    private fun setBinding() {
        binding.vm = boardListViewModel
        binding.rvBoardListBoard.adapter = boardListAdapter
        boardListAdapter.setBoardClickListener(
            object : BoardClickListener {
                override fun onClick(board: Board) {
                    findNavController().navigate(
                        BoardListFragmentDirections.actionBoardListFragmentToMindMapFragment(
                            board.id
                        )
                    )
                }

                override fun onCheckBoxClick(board: Board) {
                    boardListViewModel.selectBoard(board)
                }
            },
        )
    }

    private fun collectBoardEvent() {
        viewLifecycleOwner.lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                boardListViewModel.boardUiEvent.collectLatest { boardEvent ->
                    when (boardEvent) {
                        is BoardUiEvent.Success -> {
//                            Snackbar.make(
//                                binding.root,
//                                "성공",
//                                Snackbar.LENGTH_SHORT,
//                            )
//                                .show()
                        }

                        is BoardUiEvent.Error -> {
//                            Snackbar.make(
//                                binding.root,
//                                "실패",
//                                Snackbar.LENGTH_SHORT,
//                            )
//                                .show()
                        }

                        else -> {}
                    }
                }
            }
        }
    }

    private fun onFloatingButtonClick() {
        binding.btnBoardListAddBoard.setOnClickListener {
            if (boardListViewModel.boardUiState.value.selectBoards.isEmpty()) {
                val createBoardDialog = CreateBoardDialog()
                createBoardDialog.setCompleteListener { part, name ->
                    Log.d("BoardListFragment", "onFloatingButtonClick: success")
                    boardListViewModel.addBoard(part, name)
                }
                createBoardDialog.show(
                    requireActivity().supportFragmentManager,
                    "CreateBoardDialog"
                )
            } else {
                boardListViewModel.deleteBoard()
            }
        }
    }
}
