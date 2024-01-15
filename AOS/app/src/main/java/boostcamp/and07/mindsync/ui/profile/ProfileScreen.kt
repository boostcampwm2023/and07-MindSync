package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.dialog.NickNameDialog
import boostcamp.and07.mindsync.ui.theme.Blue1
import boostcamp.and07.mindsync.ui.theme.Gray3
import boostcamp.and07.mindsync.ui.theme.Gray4
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.theme.Red2
import coil.compose.AsyncImage
import kotlinx.coroutines.flow.collectLatest

@Composable
fun ProfileScreen(
    profileViewModel: ProfileViewModel,
    onBack: () -> Unit,
    updateNickname: (CharSequence) -> Unit,
    updateProfile: (String) -> Unit,
    editNickname: (CharSequence) -> Unit,
    showDialog: (Boolean) -> Unit,
    showImagePicker: () -> Unit,
) {
    val uiState by profileViewModel.uiState.collectAsStateWithLifecycle()
    val nicknameColor = remember { mutableStateOf(Gray4) }
    val snackBarHostState = remember { SnackbarHostState() }
    HandleProfileEvents(
        profileViewModel = profileViewModel,
        onBack = onBack,
        nicknameColor = nicknameColor,
        snackBarHostState = snackBarHostState,
    )
    Scaffold(
        snackbarHost = {
            SnackbarHost(hostState = snackBarHostState)
        },
    ) { innerPadding ->
        BoxWithConstraints(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxWidth(),
        ) {
            val guidelineTop = maxHeight * 0.15f
            val guidelineStart = maxWidth * 0.1f
            val guidelineEnd = maxWidth * 0.1f
            ProfileContent(
                profileViewModel = profileViewModel,
                guidelineTop = guidelineTop,
                uiState = uiState,
                showImagePicker = showImagePicker,
                nicknameColor = nicknameColor,
                showDialog = showDialog,
                guidelineStart = guidelineStart,
                guidelineEnd = guidelineEnd,
                updateProfile = updateProfile,
            )

            if (uiState.isShownNicknameDialog) {
                NickNameDialog(
                    uiState = uiState,
                    editNickname = editNickname,
                    closeDialog = { showDialog(false) },
                    updateNickname = { updateNickname(it) },
                )
            }
        }
    }
}

@Composable
private fun HandleProfileEvents(
    profileViewModel: ProfileViewModel,
    onBack: () -> Unit,
    nicknameColor: MutableState<Color>,
    snackBarHostState: SnackbarHostState,
) {
    LaunchedEffect(profileViewModel.event) {
        profileViewModel.event.collectLatest { event ->
            when (event) {
                is ProfileUiEvent.NavigateToBack -> onBack()

                is ProfileUiEvent.ShowMessage -> snackBarHostState.showSnackbar(
                    message = event.message,
                    duration = SnackbarDuration.Short,
                )

                is ProfileUiEvent.UpdateProfileNickName -> nicknameColor.value = Blue1
            }
        }
    }
}

@Composable
private fun ProfileContent(
    profileViewModel: ProfileViewModel,
    guidelineTop: Dp,
    uiState: ProfileUiState,
    showImagePicker: () -> Unit,
    nicknameColor: MutableState<Color>,
    showDialog: (Boolean) -> Unit,
    guidelineStart: Dp,
    guidelineEnd: Dp,
    updateProfile: (String) -> Unit,
) {
    ProfileTopAppBar { profileViewModel.onClickBack() }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(top = guidelineTop),
    ) {
        ProfileImage(
            modifier = Modifier
                .align(Alignment.CenterHorizontally),
            imageUri = uiState.imageUri,
            showImagePicker = showImagePicker,
        )

        Row(
            modifier = Modifier
                .padding(top = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Spacer(modifier = Modifier.weight(1f))
            Nickname(
                modifier = Modifier.weight(1f),
                nickname = uiState.nickname,
                nicknameColor = nicknameColor.value,
            )
            NicknameEditButton(
                modifier = Modifier.weight(0.2f),
                showDialog = showDialog,
            )
            Spacer(modifier = Modifier.weight(0.8f))
        }

        ModifyButton(
            modifier = Modifier
                .padding(
                    top = 30.dp,
                    start = guidelineStart,
                    end = guidelineEnd,
                )
                .fillMaxWidth(),
            profileImageName = stringResource(id = R.string.profile_image_name),
            updateProfile = updateProfile,
            isModify = uiState.isModify,
        )
    }
}

@Composable
private fun ProfileTopAppBar(
    onBack: () -> Unit,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(
            onClick = { onBack() },
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_back),
                contentDescription = null,
            )
        }
        Text(
            text = stringResource(id = R.string.profile_my_page),
            style = MaterialTheme.typography.displayMedium,
            modifier = Modifier
                .padding(start = 14.dp),
        )
    }
}

@Composable
private fun ProfileImage(
    modifier: Modifier = Modifier,
    imageUri: Uri,
    showImagePicker: () -> Unit,
) {
    Box(
        modifier = modifier
            .size(120.dp),
    ) {
        AsyncImage(
            model = imageUri,
            contentDescription = null,
            modifier = Modifier
                .clip(CircleShape)
                .clickable {
                    showImagePicker()
                },
            contentScale = ContentScale.Crop,
        )

        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(30.dp)
                .offset(y = 10.dp)
                .clip(shape = RoundedCornerShape(5.dp))
                .background(color = Blue1)
                .align(Alignment.TopEnd),
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_add_board),
                contentDescription = null,
                contentScale = ContentScale.Crop,
            )
        }
    }
}

@Composable
private fun Nickname(
    modifier: Modifier = Modifier,
    nickname: String,
    nicknameColor: Color,
) {
    Text(
        modifier = modifier,
        text = nickname,
        style = MaterialTheme.typography.displayLarge,
        color = nicknameColor,
        textAlign = TextAlign.Center,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
    )
}

@Composable
private fun NicknameEditButton(
    modifier: Modifier = Modifier,
    showDialog: (Boolean) -> Unit,
) {
    IconButton(
        modifier = modifier,
        onClick = { showDialog(true) },
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_outlined_drawing),
            contentDescription = null,
        )
    }
}

@Composable
private fun ModifyButton(
    modifier: Modifier = Modifier,
    profileImageName: String,
    updateProfile: (String) -> Unit,
    isModify: Boolean,
) {
    Button(
        onClick = { updateProfile(profileImageName) },
        modifier = modifier,
        colors = ButtonDefaults.buttonColors(
            containerColor = Red2,
            disabledContainerColor = Gray3,
        ),
        enabled = isModify,
    ) {
        Text(
            text = stringResource(id = R.string.profile_modify),
            style = MaterialTheme.typography.displaySmall,
            color = Color.White,
        )
    }
}

@Preview
@Composable
private fun ProfileScreenPreview() {
    MindSyncTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            ProfileScreen(
                viewModel(),
                onBack = { /*TODO*/ },
                updateNickname = { },
                updateProfile = { },
                editNickname = { },
                showDialog = { },
                showImagePicker = { },
            )
        }
    }
}
