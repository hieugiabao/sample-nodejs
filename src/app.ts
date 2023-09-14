import { config } from '@config/app';
import { ApiError } from '@models/api-error';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { AuthService } from '@services/auth/auth.service';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import { useExpressServer } from 'routing-controllers';
import * as swagger from 'swagger-express-ts';
import { Container } from 'typedi';

const app = express.default();

app.use(express.static('public'));

app.use(
  express.json({
    limit: config.app.jsonLimit,
  }),
);
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use('/swagger-ui/assets', express.static('node_modules/swagger-ui-dist'));

useExpressServer(app, {
  cors: true,
  routePrefix: config.app.api_prefix,
  controllers: [path.join(__dirname, '/controllers/**/*{.js,.ts}')],
  middlewares: [path.join(__dirname, '/common/middlewares/**/*{.js,.ts}')],
  interceptors: [path.join(__dirname, '/common/interceptors/**/*{.js,.ts}')],
  validation: true,
  defaultErrorHandler: false,
  authorizationChecker: async (action, roles: string[]) => {
    const bearer = action.request.headers['authorization'];
    if (!bearer)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ResponseCodeEnum.C0004,
        'Token not found',
      );

    if (bearer.split(' ')[0] !== 'Bearer')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ResponseCodeEnum.C0007,
        'Token schema not be accepted',
      );

    const token = bearer.split(' ')[1];

    const userService = Container.get<AuthService>(AuthService);
    const user = await userService.verifyToken(token);

    if (user && (roles.length <= 0 || roles.find((role) => user.role === role)))
      return true;
    else
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        ResponseCodeEnum.C0002,
        'You need privilege to do this action!',
      );
  },
  currentUserChecker: async (action) => {
    const bearer = action.request.headers['authorization'];
    if (!bearer)
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ResponseCodeEnum.C0004,
        'Token not found',
      );

    if (bearer.split(' ')[0] !== 'Bearer')
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ResponseCodeEnum.C0007,
        'Token schema not be accepted',
      );

    const token = bearer.split(' ')[1];

    const userService = Container.get<AuthService>(AuthService);
    return await userService.verifyToken(token);
  },
});

app.use(
  swagger.express({
    definition: {
      info: {
        title: 'My api',
        version: '1.0',
      },
      externalDocs: {
        url: '/api-docs/swagger.json',
      },
      basePath: config.app.api_prefix,
      // Models can be defined here
      securityDefinitions: {
        BearerAuth: {
          type: swagger.SwaggerDefinitionConstant.Security.Type.API_KEY,
          in: swagger.SwaggerDefinitionConstant.Security.In.HEADER,
          name: 'Authorization',
        },
      },
    },
  }),
);

export default app;
