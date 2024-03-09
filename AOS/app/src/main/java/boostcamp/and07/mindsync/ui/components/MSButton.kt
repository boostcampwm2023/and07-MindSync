package boostcamp.and07.mindsync.ui.components

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import boostcamp.and07.mindsync.ui.theme.Gray3

@Composable
fun MSButton(
    modifier: Modifier = Modifier,
    text: String = "",
    onClick: () -> Unit,
    textStyle: TextStyle = TextStyle.Default,
    backgroundColor: Color = MaterialTheme.colorScheme.primary,
    fontColor: Color = Color.Unspecified,
    shape: Shape = CircleShape,
    disableColor: Color = Gray3,
    isEnabled: Boolean = false,
) {
    Button(
        modifier = modifier,
        onClick = onClick,
        shape = shape,
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor,
            disabledContainerColor = disableColor,
        ),
        enabled = isEnabled,
    ) {
        Text(
            text = text,
            style = textStyle,
            color = fontColor,
        )
    }
}

@Preview
@Composable
fun ButtonPreview() = MSPreview {
    MSButton(
        onClick = { },
    )
}
