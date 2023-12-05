package boostcamp.and07.mindsync.ui.login

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import boostcamp.and07.mindsync.data.repository.login.LoginRepository
import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import com.kakao.sdk.auth.model.OAuthToken
import com.kakao.sdk.user.UserApiClient
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

        private fun getTokenWithKakao(kakaoUserId: Long) {
            viewModelScope.launch {
                loginRepository.loginWithKakao(kakaoUserId)
                    .onSuccess { token ->
                        Log.d("LoginViewModel", "getTokenWithKakao: $token")
                        _loginEvent.emit(LoginEvent.Success(token))
                    }.onFailure {
                        _loginEvent.emit(
                            LoginEvent.Error("${NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message}\n${it.message}}"),
                        )
                    }
            }
        }

        fun successGoogleLogin() {
            Log.d("LoginActivity", "successGoogleLogin: success!")
            // TODO : server token 요청하기
        }

        fun successKakaoLoin() {
            UserApiClient.instance.me { user, error ->
                if (error != null) {
                    Log.e("LoginActivity", "사용자 정보 요청 실패", error)
                } else if (user != null) {
                    user.id?.let { userId ->
                        getTokenWithKakao(userId)
                    }
                }
            }
        }

        fun handleGoogleSignInResult(completedTask: Task<GoogleSignInAccount>) {
            try {
                val account = completedTask.getResult(ApiException::class.java)

                val name = account.displayName
                val token = account.idToken

                // TODO : server token 요청하기
            } catch (e: ApiException) {
                viewModelScope.launch {
                    _loginEvent.emit(LoginEvent.Error("google login error: ${e.message}\n${e.stackTrace}\n${e.cause}"))
                }
            }
        }

        fun getResultCallBack(): (OAuthToken?, Throwable?) -> Unit =
            { token, error ->
                if (error != null) {
                    viewModelScope.launch {
                        _loginEvent.emit(LoginEvent.Error(NetworkExceptionMessage.ERROR_MESSAGE_KAKAO_RESULT_NULL.message))
                    }
                } else if (token != null) {
                    successKakaoLoin()
                }
            }
    }
