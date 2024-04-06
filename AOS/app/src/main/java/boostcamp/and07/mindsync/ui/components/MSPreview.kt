package boostcamp.and07.mindsync.ui.components

import androidx.compose.runtime.Composable
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme

@Composable
fun MSPreview(
    isDarkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    MindSyncTheme(darkTheme = isDarkTheme, content = content)
}
