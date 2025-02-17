import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { UploadModule } from '../upload/upload.module';
import { ProfileSpaceModule } from '../profile-space/profile-space.module';
import { AuthModule } from '../auth/auth.module';
import { MulterFileMiddleware } from '../common/middlewares/multer-file.middleware';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [ProfileSpaceModule, UploadModule, AuthModule, ProfilesModule],
  controllers: [SpacesController],
  providers: [SpacesService],
  exports: [SpacesService],
})
export class SpacesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterFileMiddleware('icon'))
      .forRoutes(
        { path: '/spaces', method: RequestMethod.POST },
        { path: '/spaces/:space_uuid', method: RequestMethod.PATCH },
      );
  }
}
