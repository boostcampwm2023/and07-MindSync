package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import kotlinx.coroutines.flow.Flow
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface ProfileRepository {
    fun getProfile(): Flow<Profile>

    fun patchProfile(
        nickname: RequestBody,
        image: MultipartBody.Part,
    ): Flow<Profile>
}
