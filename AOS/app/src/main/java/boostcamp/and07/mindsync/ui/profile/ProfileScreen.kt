package boostcamp.and07.mindsync.ui.profile

import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.theme.Blue1
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import coil.compose.AsyncImage

@Composable
fun ProfileScreen(
    uiState: ProfileUiState,
    uiEvent: ProfileUiEvent,
    onBack: () -> Unit,
    updateNickname: (CharSequence) -> Unit,
    updateProfile: (String) -> Unit,
    editNickname: (CharSequence) -> Unit,
    showDialog: (Boolean) -> Unit,
    isShownDialog: Boolean,
    showImagePicker: () -> Unit,
) {
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth(),
    ) {
        val guidelineTop = maxHeight * 0.15f
        val guidelineStart = maxWidth * 0.1f
        val guidelineEnd = maxWidth * 0.9f
        ProfileTopAppBar(onBack)
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
        }
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

@Preview
@Composable
private fun ProfileScreenPreview() {
    MindSyncTheme {
        Surface(modifier = Modifier.fillMaxSize()) {
            ProfileScreen(
                uiState = ProfileUiState(),
                uiEvent = ProfileUiEvent.NavigateToBack,
                onBack = { /*TODO*/ },
                updateNickname = { },
                updateProfile = { },
                editNickname = { },
                showDialog = { },
                isShownDialog = false,
                showImagePicker = { },
            )
        }
    }
}
