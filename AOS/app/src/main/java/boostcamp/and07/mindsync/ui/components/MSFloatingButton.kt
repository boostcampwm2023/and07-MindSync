package boostcamp.and07.mindsync.ui.components

import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import boostcamp.and07.mindsync.R

@Composable
fun RecycleBinRestoreFloatingButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    backgroundColor: Color = Color(0xFFD4BFF9),
) {
    FloatingActionButton(
        modifier = modifier,
        onClick = onClick,
        containerColor = backgroundColor,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_restore_board),
            contentDescription = null,
        )
    }
}

@Composable
fun RefreshFloatingButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    backgroundColor: Color = Color(0xFFD4BFF9),
) {
    FloatingActionButton(
        modifier = modifier,
        onClick = onClick,
        containerColor = backgroundColor,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_restore_board),
            contentDescription = null,
        )
    }
}