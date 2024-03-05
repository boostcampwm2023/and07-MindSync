package boostcamp.and07.mindsync.ui.boardlist

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import boostcamp.and07.mindsync.ui.base.BaseComposeFragment
import boostcamp.and07.mindsync.ui.dialog.CreateBoardViewModel
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import java.io.File

@AndroidEntryPoint
class BoardListFragment : BaseComposeFragment() {
    private val boardListViewModel: BoardListViewModel by viewModels()
    private val createBoardViewModel: CreateBoardViewModel by viewModels()

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            val file = File(uri.toAbsolutePath(requireContext()))
            createBoardViewModel.setBoardImage(uri.toString())
            createBoardViewModel.setImageFile(file)
        }
    }

    private fun navigateToMindMap(
        boardId: String,
        boardName: String,
    ) {
        findNavController().navigate(
            BoardListFragmentDirections.actionBoardListFragmentToMindMapFragment(
                boardId = boardId,
                boardName = boardName,
            ),
        )
    }

    @Composable
    override fun Screen() {
        MindSyncTheme {
            BoardListScreen(
                boardListViewModel = boardListViewModel,
                onCheckBoxClicked = { boardListViewModel.selectBoard() },
                refreshBoard = { boardListViewModel.restoreBoard() },
                showDialog = { boardListViewModel.showCreateBoardDialog(it) },
                deleteBoard = { boardListViewModel.deleteBoard() },
                createBoardViewModel = createBoardViewModel,
                createBoard = { imageFile, imageName ->
                    boardListViewModel.addBoard(imageFile, imageName)
                },
                onAcceptClicked = { uri -> createImage(uri) },
                navigateToMindMap = { boardId, boardName ->
                    navigateToMindMap(boardId, boardName)
                },
            )
        }
    }
}
