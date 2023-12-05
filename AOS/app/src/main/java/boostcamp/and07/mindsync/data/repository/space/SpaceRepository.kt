package boostcamp.and07.mindsync.data.repository.space

import boostcamp.and07.mindsync.data.model.Space
import okhttp3.MultipartBody

interface SpaceRepository {
    suspend fun addSpace(
        name: String,
        icon: MultipartBody.Part,
    ): Result<Space>
}
