package boostcamp.and07.mindsync.ui.space.generate

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.theme.Blue1
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme

@Composable
fun AddSpaceScreen() {
    Row(modifier = Modifier.fillMaxWidth()) {
        IconButton(modifier = Modifier.size(25.dp), onClick = {}) {
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
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 50.dp),
        horizontalArrangement = Arrangement.Absolute.Center,
    ) {
        Text(
            text = stringResource(id = R.string.generate_space_title),
            style = MaterialTheme.typography.displayMedium,
            textAlign = TextAlign.Center,
        )
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 150.dp),
        horizontalArrangement = Arrangement.Center,
    ) {
        Box {
            Image(
                painterResource(id = R.drawable.ic_app_logo_foreground),
                contentDescription = null,
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
    Row(
        modifier = Modifier.fillMaxWidth()
            .padding(top = 250.dp),
        horizontalArrangement = Arrangement.Center,
    ) {
        var value = stringResource(id = R.string.space_name_hint)

        TextField(
            value = value,
            onValueChange = { value = it },
            maxLines = 2,
            modifier = Modifier.padding(20.dp),
        )
    }
    Row(
        modifier = Modifier.padding(top = 400.dp)
            .fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
    ) {
        Button(onClick = {}, Modifier.width(264.dp)) {
            Text(text = stringResource(id = R.string.check_message))
        }
    }
}



@Preview(showSystemUi = true, showBackground = true)
@Composable
private fun AddSpaceScreenPreview() {
    MindSyncTheme {
        AddSpaceScreen()
    }
}

