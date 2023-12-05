package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface ProfileRepository {
    suspend fun addProfile(
        nickname: RequestBody,
        image: MultipartBody.Part,
    ): Result<Profile>
}
