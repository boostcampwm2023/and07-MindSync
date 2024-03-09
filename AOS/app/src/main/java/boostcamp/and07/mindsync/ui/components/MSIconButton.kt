package boostcamp.and07.mindsync.ui.components

import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import boostcamp.and07.mindsync.R

@Composable
fun BackIconButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    iconColor: Color = Color.Black,
) {
    IconButton(
        modifier = modifier,
        onClick = onClick,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_back),
            contentDescription = null,
            tint = iconColor,
        )
    }
}

@Composable
fun MenuIconButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    iconColor: Color = Color.Black,
) {
    IconButton(
        modifier = modifier,
        onClick = onClick,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_menu),
            contentDescription = null,
            tint = iconColor,
        )
    }
}

@Composable
fun CircleAddIconButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    iconColor: Color = Color.Black,
) {
    IconButton(
        modifier = modifier,
        onClick = onClick,
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_add),
            contentDescription = null,
            tint = iconColor,
        )
    }
}
