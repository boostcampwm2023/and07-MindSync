package boostcamp.and07.mindsync.ui.dialog

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.profile.ProfileUiState
import boostcamp.and07.mindsync.ui.theme.Black
import boostcamp.and07.mindsync.ui.theme.Gray4
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme

@Composable
fun NickNameDialog(
    uiState: ProfileUiState,
    editNickname: (CharSequence) -> Unit,
    closeDialog: () -> Unit,
    updateNickname: (CharSequence) -> Unit,
) {
    val screenWidth = LocalConfiguration.current.screenWidthDp.dp
    val dialogWidth = screenWidth * 0.8f
    var textFieldValue = remember {
        mutableStateOf(
            TextFieldValue(
                text = uiState.nickname,
                selection = TextRange(uiState.nickname.length),
            ),
        )
    }
    val focusRequester = remember {
        FocusRequester()
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Dialog(
        onDismissRequest = {
        },
    ) {
        Column(
            modifier = Modifier
                .background(Color.White, RoundedCornerShape(20.dp))
                .width(dialogWidth)
                .padding(start = 10.dp, top = 20.dp, end = 10.dp),
        ) {
            Text(
                text = stringResource(id = R.string.profile_nickname_modify),
                modifier = Modifier,
                style = MaterialTheme.typography.displaySmall,
            )

            OutlinedTextField(
                value = textFieldValue.value,
                onValueChange = { textFieldValue.value = it; editNickname(it.text) },
                modifier = Modifier
                    .padding(5.dp)
                    .focusRequester(focusRequester),
                placeholder = {
                    Text(text = stringResource(id = R.string.profile_name_limit))
                },
                supportingText = {
                    Text(
                        text = "${uiState.editingNickname.length}",
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.End,
                    )
                },
                textStyle = TextStyle.Default.copy(fontSize = 16.sp),
            )
            Row(modifier = Modifier.align(Alignment.End)) {
                TextButton(
                    onClick = { closeDialog() },
                    modifier = Modifier,
                ) {
                    Text(
                        text = stringResource(id = R.string.cancel_message),
                        color = Black,
                        fontSize = 14.sp,
                    )
                }

                TextButton(
                    onClick = { updateNickname(uiState.editingNickname); closeDialog() },
                    modifier = Modifier,
                    enabled = when (uiState.editingNickname.length) {
                        in 1..20 -> true
                        else -> false
                    },
                ) {
                    Text(
                        text = stringResource(id = R.string.profile_modify),
                        color = if (uiState.editingNickname.isNotEmpty()) Black else Gray4,
                        fontSize = 12.sp,
                    )
                }
            }
        }
    }
}

@Preview
@Composable
private fun NickNameDialogPreview() {
    MindSyncTheme {
        Surface {
            NickNameDialog(
                uiState = ProfileUiState(),
                editNickname = { },
                closeDialog = { /*TODO*/ },
                updateNickname = { },
            )
        }
    }
}
