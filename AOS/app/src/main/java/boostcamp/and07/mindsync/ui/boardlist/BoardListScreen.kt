package boostcamp.and07.mindsync.ui.boardlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import coil.compose.AsyncImage

@Composable
fun BoardListScreen(
    boardListViewModel: BoardListViewModel,
    createBoardViewModel: CreateBoardViewModel,
    onCheckBoxClicked: (Board) -> Unit,
    refreshBoard: () -> Unit,
    showDialog: (Boolean) -> Unit,
    deleteBoard: () -> Unit,
    createBoard: (File?, String) -> Unit,
    onAcceptClicked: (Uri) -> Unit,
) {
    val uiState by boardListViewModel.boardUiState.collectAsStateWithLifecycle()
    Scaffold(bottomBar = { BoardListBottomBar() }) { innerPadding ->
        BoxWithConstraints(
            modifier =
            Modifier
                .padding(innerPadding)
                .fillMaxWidth(),
        ) {
            BoardListComponent(
                uiState = uiState,
            )
            if (uiState.isShownDialog) {
                AddBoardScreen(
                    createBoardViewModel = createBoardViewModel,
                    createBoard = createBoard,
                    updateBoardName = { createBoardViewModel.onBoardNameChanged(it, 0, 0, 0) },
                    createImage = onAcceptClicked,
                    closeDialog = showDialog,
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun BoardListComponent(
    uiState: BoardUiState = BoardUiState(),
) {
    val scrollState = rememberLazyGridState()
    val boards: List<Board> = listOf<Board>(
        Board(
            id = "1",
            date = "2023-01-01",
            name = "board111111111121212121212121212212121",
            imageUrl = "",
            isChecked = true,
        ),
        Board(id = "2", date = "2023-01-02", name = "board2", imageUrl = "", isChecked = false),
        Board(id = "3", date = "2023-01-03", name = "board3", imageUrl = "", isChecked = true),
    )
    LazyVerticalGrid(
        state = scrollState,
        columns = GridCells.Adaptive(minSize = 128.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        contentPadding = PaddingValues(20.dp),
        content = {
            items(
                items = boards,
                itemContent = { BoardRow(board = it) },
            )
        },
    )
}

@Composable
fun BoardRow(board: Board) {
    Column {
        Row() {
            Checkbox(checked = board.isChecked, onCheckedChange = {})
            BoardThumbnail(imageUrl = board.imageUrl)
        }
        Spacer(modifier = Modifier.height(10.dp))
        Row(modifier = Modifier.fillMaxSize()) {
            BoardDetail(boardName = board.name, boardDate = board.date)
        }
    }
}

@Composable
fun BoardThumbnail(imageUrl: String) {
    AsyncImage(
        model = imageUrl,
        contentDescription = null,
        placeholder = painterResource(id = R.drawable.ic_placeholder),
        error = painterResource(id = R.drawable.ic_placeholder),
        modifier =
        Modifier
            .size(width = 100.dp, height = 100.dp)
            .clip(CircleShape),
        contentScale = ContentScale.Crop,
    )
}

@Composable
fun BoardDetail(boardName: String, boardDate: String) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                modifier = Modifier.fillMaxWidth(),
                text = boardName,
                style = MaterialTheme.typography.displaySmall,
                textAlign = TextAlign.Center,
                overflow = TextOverflow.Ellipsis,
                maxLines = 1,
            )
            Text(
                modifier = Modifier.fillMaxWidth(),
                text = boardDate,
                style = MaterialTheme.typography.displaySmall,
                textAlign = TextAlign.Center,
                overflow = TextOverflow.Ellipsis,
                maxLines = 1,
            )
        }
    }
}

@Composable
fun BoardListBottomBar() {
    Row(modifier = Modifier.fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.Start) {
            FloatingActionButton(onClick = {}) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_refresh_board),
                    contentDescription = null,
                )
            }
        }
        Spacer(modifier = Modifier.weight(1f))
        Column(horizontalAlignment = Alignment.End) {
            FloatingActionButton(onClick = { /*TODO*/ }) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_add_board),
                    contentDescription = null,
                )
            }
        }
    }
}

@Preview(showSystemUi = true, showBackground = true)
@Composable
private fun BoardListPreview() {
    MindSyncTheme {
        BoardListComponent()
    }
}
