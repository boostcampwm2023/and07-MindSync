package boostcamp.and07.mindsync.ui.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.login.LoginRepository
import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel
    @Inject
    constructor(
        private val loginRepository: LoginRepository,
    ) :
    ViewModel() {
        private val _loginEvent = MutableSharedFlow<LoginEvent>()
        val loginEvent = _loginEvent.asSharedFlow()

        fun getTokenWithKakao(kakaoUserId: String) {
            viewModelScope.launch {
                loginRepository.loginWithKakao(kakaoUserId)
                    .onSuccess {
                        _loginEvent.emit(LoginEvent.LoginSuccess)
                    }.onFailure {
                        _loginEvent.emit(
                            LoginEvent.LoginError("${NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message}\n${it.message}}"),
                        )
                    }
            }
        }
    }
