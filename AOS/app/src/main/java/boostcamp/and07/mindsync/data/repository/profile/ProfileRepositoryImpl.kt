package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import boostcamp.and07.mindsync.data.network.ProfileApi
import okhttp3.MultipartBody
import okhttp3.RequestBody
import javax.inject.Inject

class ProfileRepositoryImpl
@Inject
constructor(private val profileApi: ProfileApi) : ProfileRepository {
    override suspend fun addProfile(
        nickname: RequestBody,
        image: MultipartBody.Part,
    ): Result<Profile> {
        val response = profileApi.addProfile(nickname, image)
        return try {
            if (response.isSuccessful) {
                response.body()?.let { profileResponse ->
                    return Result.success(
                        Profile(
                            id = profileResponse.uuid,
                            imageUrl = profileResponse.image ?: "",
                            nickname = profileResponse.nickname ?: "",
                        ),
                    )
                }
                throw Exception()
            } else {
                Result.failure(Exception())
            }
        } catch (e: Exception) {
            Result.failure(Exception())
        }
    }
}
