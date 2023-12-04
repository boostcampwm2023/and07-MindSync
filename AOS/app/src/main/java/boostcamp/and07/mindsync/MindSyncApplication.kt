package boostcamp.and07.mindsync

import android.app.Application
import com.kakao.sdk.common.KakaoSdk

class MindSyncApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        KakaoSdk.init(this, BuildConfig.KAKAO_CLIENT_ID)
    }
}
