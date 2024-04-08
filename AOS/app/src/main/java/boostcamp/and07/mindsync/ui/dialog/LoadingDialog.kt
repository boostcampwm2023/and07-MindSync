package boostcamp.and07.mindsync.ui.dialog

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme

@Composable
fun LoadingDialogScreen() {
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    val screenHeight = LocalConfiguration.current.screenHeightDp.dp
    val dialogWidth = screenWidth * 0.8f

    Dialog(onDismissRequest = {}) {
        Column(
            modifier = Modifier
                .width(dialogWidth)
                .height(screenHeight),
            verticalArrangement = Arrangement.Center,
        ) {
            Row(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(100.dp),
                    color = Color.LightGray,
                    strokeWidth = 10.dp,
                )
            }
            Spacer(modifier = Modifier.height(30.dp))
            Row(
                modifier = Modifier.align(Alignment.CenterHorizontally),
            ) {
                Text(
                    text = stringResource(id = R.string.disconnected_network_message),
                    style = MaterialTheme.typography.displaySmall,
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun LoadingDialogPreview() {
    MindSyncTheme {
        LoadingDialogScreen()
    }
}
