package boostcamp.and07.mindsync.data.repository.space

import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.SpaceApi
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
                        return Result.success(
                            Space(
                                id = spaceResponse.uuid,
                                name = spaceResponse.name ?: "",
                                imageUrl = spaceResponse.icon ?: "",
                            ),
                        )
                    }
                    throw Exception("body null")
                } else {
                    Result.failure(Exception("response fail"))
                }
            } catch (e: Exception) {
                Result.failure(Exception(e.message))
            }
        }
    }
