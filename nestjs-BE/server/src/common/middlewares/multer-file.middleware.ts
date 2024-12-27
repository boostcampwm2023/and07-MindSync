import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';

export function MulterFileMiddleware(fieldName: string) {
  @Injectable()
  class MulterSingleMiddleware implements NestMiddleware {
    readonly multerInstance = multer();

    use(req: Request, res: Response, next: NextFunction) {
      this.multerInstance.single(fieldName)(req, res, next);
    }
  }

  return MulterSingleMiddleware;
}
