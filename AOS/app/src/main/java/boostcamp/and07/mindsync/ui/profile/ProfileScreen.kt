package boostcamp.and07.mindsync.ui.profile

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme

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
    Scaffold(
        topBar = {
            ProfileTopAppBar(onBack)
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding),
        ) {
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
