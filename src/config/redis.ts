import * as redis from 'redis';
import { config } from './app';

const client = redis.createClient({
  url: `redis://:${config.redis.password}@${config.redis.url}:${config.redis.port}`,
});

export default client;
