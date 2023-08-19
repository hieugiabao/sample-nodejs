import { config } from '@config/app';
import { parse, ConnectionOptions as parseOptions } from 'pg-connection-string';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import path from 'path';

interface CustomOptions extends parseOptions {
  schema: string;
}

const database_url = config.postgres.url;

const db = parse(database_url) as CustomOptions;

export const schema = db.schema || 'public';

export const connectionOptions: DataSourceOptions = {
  type: 'postgres',
  host: db.host,
  port: Number(db.port),
  schema: schema,
  database: db.database,
  username: db.user,
  password: db.password,
  entities: [
    path.join(__dirname, '../../entities/postgres-entities/*{.js,.ts}'),
  ],
  migrations: [path.join(__dirname, '../../migrations/*{.js,.ts}')],
  // subscribers:
  synchronize: false,
  logging:
    process.env.NODE_ENV != 'development' ? ['error'] : ['query', 'error'],
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    // set pool max size to 1
    max: 1,
    //  close idle clients after 1 second
    idleTimeoutMillis: 1000,
  },
};
