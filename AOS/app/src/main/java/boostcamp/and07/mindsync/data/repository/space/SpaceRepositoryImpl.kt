package boostcamp.and07.mindsync.data.repository.space

import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.SpaceApi
import boostcamp.and07.mindsync.ui.util.ResponseErrorMessage
import okhttp3.MultipartBody
import okhttp3.RequestBody
import javax.inject.Inject

class SpaceRepositoryImpl
    @Inject
    constructor(private val spaceApi: SpaceApi) : SpaceRepository {
        override suspend fun addSpace(
            name: RequestBody,
            icon: MultipartBody.Part,
        ): Result<Space> {
            val response = spaceApi.addSpace(name, icon)
            return try {
                if (response.isSuccessful) {
                    response.body()?.let { spaceResponse ->
                        spaceResponse.data?.let { spaceData ->
                            return Result.success(
                                Space(
                                    id = spaceData.uuid,
                                    name = spaceData.name ?: "",
                                    imageUrl = spaceData.icon ?: "",
                                ),
                            )
                        }
                    }
                    throw Exception(ResponseErrorMessage.ERROR_MESSAGE_BODY_NULL.message)
                } else {
                    Result.failure(Exception(ResponseErrorMessage.ERROR_MESSAGE_RESPONSE_FAIL.message))
                }
            } catch (e: Exception) {
                Result.failure(Exception(e.message))
            }
        }

        override suspend fun getSpace(spaceUuid: String): Result<Space> {
            val response = spaceApi.getSpace(spaceUuid)
            return try {
                if (response.isSuccessful) {
                    response.body()?.let { spaceResponse ->
                        spaceResponse.data?.let { spaceData ->
                            return Result.success(
                                Space(
                                    id = spaceData.uuid,
                                    name = spaceData.name ?: "",
                                    imageUrl = spaceData.icon ?: "",
                                ),
                            )
                        }
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
