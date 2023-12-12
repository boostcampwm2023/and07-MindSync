package boostcamp.and07.mindsync.ui.boardlist

import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.FragmentBoardListBinding
import boostcamp.and07.mindsync.ui.base.BaseFragment
import boostcamp.and07.mindsync.ui.util.setClickEvent
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class BoardListFragment :
    BaseFragment<FragmentBoardListBinding>(R.layout.fragment_board_list) {
    private val boardListViewModel: BoardListViewModel by viewModels()
    private val boardListAdapter = BoardListAdapter()
    private val args: BoardListFragmentArgs by navArgs()

    override fun initView() {
        setBinding()
        collectBoardEvent()
        onFloatingButtonClick()
        boardListViewModel.setSpaceId(args.spaceId)
    }

    private fun setBinding() {
        binding.vm = boardListViewModel
        binding.rvBoardListBoard.adapter = boardListAdapter
        boardListAdapter.setBoardClickListener(
            object : BoardClickListener {
                override fun onClick(board: Board) {
                    findNavController().navigate(
                        BoardListFragmentDirections.actionBoardListFragmentToMindMapFragment(
                            board.id,
                            board.name,
                        ),
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
                        is BoardUiEvent.Success -> {}

                        is BoardUiEvent.Error -> {
                            Snackbar.make(
                                binding.root,
                                boardEvent.message,
                                Snackbar.LENGTH_SHORT,
                            )
                                .show()
                        }

                        else -> {}
                    }
                }
            }
        }
    }

    private fun onFloatingButtonClick() {
        binding.btnBoardListAddBoard.setClickEvent(lifecycleScope) {
            if (boardListViewModel.boardUiState.value.selectBoards.isEmpty()) {
                val createBoardDialog = CreateBoardDialog()
                createBoardDialog.setCompleteListener { part, name ->
                    boardListViewModel.addBoard(part, name)
                }
                createBoardDialog.show(
                    requireActivity().supportFragmentManager,
                    "CreateBoardDialog",
                )
            } else {
                boardListViewModel.deleteBoard()
            }
        }
        binding.btnBoardListRefresh.setClickEvent(lifecycleScope) {
            boardListViewModel.getBoards()
        }
    }
}
