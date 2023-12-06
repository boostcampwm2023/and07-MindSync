package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import boostcamp.and07.mindsync.data.network.ProfileApi
import boostcamp.and07.mindsync.ui.util.ResponseErrorMessage
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
                    throw Exception(ResponseErrorMessage.ERROR_MESSAGE_BODY_NULL.message)
                } else {
                    Result.failure(Exception(ResponseErrorMessage.ERROR_MESSAGE_RESPONSE_FAIL.message))
                }
            } catch (e: Exception) {
                Result.failure(Exception(e.message))
            }
        }

        override suspend fun getProfile(): Result<Profile> {
            val response = profileApi.getProfile()
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
                    throw Exception(ResponseErrorMessage.ERROR_MESSAGE_BODY_NULL.message)
                } else {
                    Result.failure(Exception(ResponseErrorMessage.ERROR_MESSAGE_RESPONSE_FAIL.message))
                }
            } catch (e: Exception) {
                Result.failure(Exception(e.message))
            }
        }
    }
