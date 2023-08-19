import { logger } from '@common/logger';
import { Request, Response } from 'express';
import { ApiError } from '@models/api-error';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { StatusCodes } from 'http-status-codes';
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from 'routing-controllers';
import { Service } from 'typedi';

@Middleware({ type: 'after' })
@Service()
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error(
    error: any,
    request: Request,
    response: Response,
    next?: (err?: any) => any,
  ): void {
    if (error instanceof ApiError) {
      logger.error(error);
      response.status(error._status).send(error.toErrorResponse());
    } else if (response.statusCode === StatusCodes.NOT_FOUND) {
      error = new ApiError(StatusCodes.NOT_FOUND, ResponseCodeEnum.C0001);
      logger.error(error);
      response.status(error._status).send(error.toErrorResponse());
    } else {
      logger.error('Unhandled error: path', request.url, error);
      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(
          new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            ResponseCodeEnum.C0000,
          ).toErrorResponse(),
        );
    }
    next();
  }
}
