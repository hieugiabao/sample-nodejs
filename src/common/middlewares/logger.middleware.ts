import { logger } from '@common/logger';
import { Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Middleware({ type: 'before' })
@Service()
export class LoggerBeforeMiddleware implements ExpressMiddlewareInterface {
  async use(request: Request, _response: Response, next: (err?: any) => any) {
    logger.info(`Start: ${request.method} ${request.url}`);

    if (Object.keys(request.params || {}).length > 0) {
      logger.info(`Params: ${JSON.stringify(request.params)}`);
    }

    if (Object.keys(request.query || {}).length > 0) {
      logger.info(`Query: ${JSON.stringify(request.query)}`);
    }

    if (Object.keys(request.body || {}).length > 0) {
      const body = JSON.stringify(request.body).replace(
        /"password":".*?"/g,
        '"password":"[MASKED]"',
      );
      logger.info(`Body: ${body}`);
    }
    next();
  }
}

@Middleware({ type: 'after' })
@Service()
export class LoggerAfterMiddleware implements ExpressMiddlewareInterface {
  async use(request: Request, _response: Response, next: (err?: any) => any) {
    logger.info(`End: ${request.method} ${request.url}`);
    next();
  }
}
