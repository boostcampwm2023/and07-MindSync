package boostcamp.and07.mindsync.ui.dialog

import android.net.Uri
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.boardlist.BoardListUiState
import boostcamp.and07.mindsync.ui.theme.Blue1
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.theme.Yellow4
import coil.compose.AsyncImage
import java.io.File

@Composable
fun AddBoardDialogScreen(
    boardUiState: BoardListUiState,
    createBoard: (File?, String) -> Unit,
    updateBoardName: (CharSequence) -> Unit,
    createImage: (Uri) -> Unit,
    closeDialog: () -> Unit,
) {
    Scaffold { innerPadding ->
        BoxWithConstraints(
            modifier =
                Modifier
                    .padding(innerPadding),
        ) {
            AddBoardDialogContent(
                uiState = boardUiState,
                createBoard = createBoard,
                updateBoardName = updateBoardName,
                createImage = createImage,
                closeDialog = {
                    closeDialog()
                },
            )
        }
    }
}

@Composable
fun AddBoardDialogContent(
    uiState: BoardListUiState = BoardListUiState(),
    closeDialog: () -> Unit = {},
    createBoard: (File?, String) -> Unit = { imageFile, imageName -> {} },
    updateBoardName: (CharSequence) -> Unit = {},
    createImage: (Uri) -> Unit = {},
) {
    val imageLauncher =
        rememberLauncherForActivityResult(
            contract = ActivityResultContracts.PickVisualMedia(),
            onResult = { uri ->
                uri?.let { imageThumbnail ->
                    createImage(imageThumbnail)
                }
            },
        )
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    val dialogWidth = screenWidth * 0.8f
    Dialog(onDismissRequest = closeDialog) {
        Column(
            modifier =
                Modifier
                    .width(dialogWidth)
                    .background(color = Yellow4),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start,
            ) {
                IconButton(onClick = closeDialog) {
                    Image(
                        painterResource(id = R.drawable.ic_back),
                        contentDescription = null,
                    )
                }
            }
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth(),
                horizontalArrangement = Arrangement.Absolute.Center,
            ) {
                AddBoardTopBar()
            }
            Spacer(modifier = Modifier.height(30.dp))
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth(),
                horizontalArrangement = Arrangement.Absolute.Center,
            ) {
                AddBoardThumbnail(onImageClicked = imageLauncher, imageUrl = uiState.boardImage)
            }
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .padding(start = 20.dp, end = 20.dp),
                horizontalArrangement = Arrangement.Center,
            ) {
                InputBoardNameField(uiState = uiState, updateBoardName = updateBoardName)
            }
            Row(
                modifier =
                    Modifier
                        .fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
            ) {
                BoardNameInputButton(
                    createBoard = createBoard,
                    uiState = uiState,
                    closeDialog = closeDialog,
                )
            }
        }
    }
}

@Composable
fun AddBoardTopBar() {
    Text(
        text = stringResource(id = R.string.create_board_introduce),
        style = MaterialTheme.typography.displayMedium,
        textAlign = TextAlign.Center,
    )
}

@Composable
fun AddBoardThumbnail(
    onImageClicked: ManagedActivityResultLauncher<PickVisualMediaRequest, Uri?>,
    imageUrl: String,
) {
    Box(
        modifier =
            Modifier
                .size(120.dp),
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = null,
            placeholder = painterResource(id = R.drawable.ic_placeholder),
            error = painterResource(id = R.drawable.ic_placeholder),
            modifier =
                Modifier
                    .clickable {
                        onImageClicked.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                        )
                    }
                    .clip(CircleShape),
            contentScale = ContentScale.Crop,
        )
        Box(
            Modifier
                .size(25.dp)
                .clip(shape = RoundedCornerShape(5.dp))
                .background(color = Blue1)
                .align(Alignment.TopEnd),
        ) {
            IconButton(onClick = {
                onImageClicked.launch(
                    PickVisualMediaRequest(
                        ActivityResultContracts.PickVisualMedia.ImageOnly,
                    ),
                )
            }) {
                Image(
                    painterResource(id = R.drawable.ic_add_board),
                    contentDescription = null,
                )
            }
        }
    }
}

@Composable
fun InputBoardNameField(
    uiState: BoardListUiState,
    updateBoardName: (CharSequence) -> Unit,
) {
    val boardHint = stringResource(id = R.string.board_list_board_name_hint)
    var boardName =
        remember {
            mutableStateOf(
                TextFieldValue(
                    text = uiState.boardName,
                ),
            )
        }
    TextField(
        modifier =
            Modifier
                .fillMaxWidth()
                .padding(20.dp),
        value = boardName.value,
        onValueChange = {
            boardName.value = it
            updateBoardName(it.text)
        },
        supportingText = {
            Text(
                text = "${uiState.boardName.length}",
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.End,
            )
        },
        placeholder = { Text(boardHint) },
    )
}

@Composable
fun BoardNameInputButton(
    createBoard: (File?, String) -> Unit,
    uiState: BoardListUiState,
    closeDialog: () -> Unit,
) {
    val icon = stringResource(id = R.string.board_multipart_image_name)
    Button(
        onClick = {
            createBoard(uiState.boardThumbnailFile, uiState.boardName)
            closeDialog()
        },
        enabled = uiState.boardName.length in 1..20,
        modifier = Modifier.width(264.dp),
        colors =
            ButtonDefaults.buttonColors(
                disabledContainerColor = Color.LightGray,
            ),
    ) {
        Text(text = stringResource(id = R.string.check_message))
    }
}

@Preview(showBackground = true)
@Composable
private fun AddBoardPreview() {
    MindSyncTheme {
        AddBoardDialogContent()
    }
}
