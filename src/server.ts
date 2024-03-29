import 'reflect-metadata';
import { Database } from '@config/db';
import app from './app';
import { config } from '@config/app';
import RedisClient from '@config/redis';
import { Container } from 'typedi';
import { useContainer } from 'routing-controllers';

const startServer = async () => {
  useContainer(Container);
  await Database.initDataSource();

  app
    .listen(config.port, () => {
      RedisClient.connect();
      console.log(
        `⚡️[server]: Server is running at http://localhost:${config.port}`,
      );
    })
    .on('error', (err) => {
      console.error(err);
    });
};

startServer()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
