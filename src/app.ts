import { useContainer as useContainerValidator } from 'class-validator';
import {
  useContainer as useContainerRouting,
  useExpressServer,
} from 'routing-controllers';
import * as path from 'path';
import * as express from 'express';
import * as swagger from 'swagger-express-ts';
import Container from 'typedi';
import { config } from '@config/app';

useContainerValidator(Container);
useContainerRouting(Container);

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
    },
  }),
);

export default app;
