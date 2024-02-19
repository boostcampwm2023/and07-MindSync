package boostcamp.and07.mindsync.ui.space.generate

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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.space.SpaceUiState
import boostcamp.and07.mindsync.ui.theme.Blue1
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.theme.Yellow4
import coil.compose.AsyncImage

@Composable
fun AddSpaceScreen(
    addSpaceViewModel: AddSpaceViewModel,
    onBackClicked: () -> Unit,
    createSpace: (String) -> Unit,
    updateSpaceName: (String) -> Unit,
    createImage: (Uri) -> Unit,
) {
    val uiState by addSpaceViewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            AddSpaceTopBar(onBackClicked)
        },
        containerColor = Yellow4,
    ) { innerPadding ->
        BoxWithConstraints(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxWidth(),
        ) {
            AddSpaceContent(
                uiState = uiState,
                createSpace = createSpace,
                updateSpaceName = updateSpaceName,
                createImage = createImage,
            )
        }
    }
}

@Composable
fun AddSpaceContent(
    uiState: SpaceUiState = SpaceUiState(),
    createSpace: (String) -> Unit = {},
    updateSpaceName: (String) -> Unit = {},
    createImage: (Uri) -> Unit = {},
) {
    val imageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            uri?.let { imageThumbnail ->
                createImage(imageThumbnail)
            }
        },
    )
    Row(
        modifier = Modifier
            .padding(top = 30.dp)
            .fillMaxWidth(),
        horizontalArrangement = Arrangement.Absolute.Center,
    ) {
        AddSpaceInfo()
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 150.dp),
        horizontalArrangement = Arrangement.Absolute.Center,
    ) {
        AddSpaceThumbnail(onImageClicked = imageLauncher, imageUrl = uiState.spaceThumbnail)
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 300.dp),
        horizontalArrangement = Arrangement.Center,
    ) {
        InputSpaceNameField(uiState = uiState, updateSpaceName = updateSpaceName)
    }
    Row(
        modifier = Modifier
            .padding(top = 400.dp)
            .fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
    ) {
        SpaceNameInputButton(createSpace = createSpace)
    }
}

@Composable
fun AddSpaceTopBar(onBackClicked: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth()) {
        IconButton(
            modifier = Modifier
                .size(25.dp).padding(15.dp),
            onClick = onBackClicked,
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_back),
                contentDescription = "뒤로가기",
            )
        }
        Text(
            text = stringResource(id = R.string.generate_space_menu_message),
            style = MaterialTheme.typography.displaySmall,
            modifier = Modifier.padding(start = 14.dp),
        )
    }
}

@Composable
fun AddSpaceInfo() {
    Text(
        text = stringResource(id = R.string.generate_space_title),
        style = MaterialTheme.typography.displayMedium,
        textAlign = TextAlign.Center,
    )
}

@Composable
fun AddSpaceThumbnail(
    onImageClicked: ManagedActivityResultLauncher<PickVisualMediaRequest, Uri?>,
    imageUrl: String,
) {
    Box(
        modifier = Modifier
            .size(120.dp),
    ) {
        AsyncImage(
            model = imageUrl,
            contentDescription = null,
            placeholder = painterResource(id = R.drawable.ic_placeholder),
            error = painterResource(id = R.drawable.ic_placeholder),
            modifier = Modifier
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
            IconButton(onClick = { /*TODO*/ }) {
                Image(
                    painterResource(id = R.drawable.ic_add_board),
                    contentDescription = null,
                )
            }
        }
    }
}

@Composable
fun InputSpaceNameField(
    uiState: SpaceUiState,
    updateSpaceName: (String) -> Unit,
) {
    val spaceHint = stringResource(id = R.string.space_name_hint)
    var spaceName by remember {
        mutableStateOf(
            TextFieldValue(
                text = uiState.spaceName,
            ),
        )
    }
    TextField(
        value = spaceName,
        onValueChange = {
            spaceName = it
            updateSpaceName(it.text)
        },
        modifier = Modifier.padding(20.dp),
        placeholder = { Text(spaceHint) },
    )
}

@Composable
fun SpaceNameInputButton(createSpace: (String) -> Unit) {
    val icon = stringResource(id = R.string.space_image_name)
    Button(onClick = {
        createSpace(icon)
    }, Modifier.width(264.dp)) {
        Text(text = stringResource(id = R.string.check_message))
    }
}

@Preview(showSystemUi = true, showBackground = true)
@Composable
private fun AddSpacePreview() {
    MindSyncTheme {
        AddSpaceContent()
    }
}
