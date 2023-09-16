import { DataSource } from 'typeorm';
import { Database } from '.';
import Container from 'typedi';
import * as mongoose from 'mongoose';

describe('Database connection', () => {
  let postgresDataSource: DataSource;
  let mongoConnection: mongoose.Connection;

  beforeAll(async () => {
    await Database.initDataSource();
    postgresDataSource = await Database.getPostgresConnection();
    expect(postgresDataSource).toBeDefined();

    mongoConnection = await Database.getMongoConnection();
    expect(mongoConnection).toBeDefined();
  });

  afterAll(async () => {
    await Database.close();
  });

  it('should be able to connect to the postgres database', async () => {
    expect(postgresDataSource.isInitialized).toBeTruthy();
  });

  it('should be able to ping to the postgres database', async () => {
    const res = await postgresDataSource.query('SELECT 1');
    expect(res).toEqual([{ '?column?': 1 }]);
  });

  it('should inject database connection to the service', async () => {
    const dataSourceInjected = Container.get(DataSource);
    expect(dataSourceInjected).toBeDefined();
    expect(dataSourceInjected).toEqual(postgresDataSource);
  });

  it('should be able to connect to the mongo database', async () => {
    expect(mongoConnection.readyState).toBe(1);
  });

  it('should be able to ping to the mongo database', async () => {
    const res = await mongoConnection.db.admin().ping();
    expect(res).toEqual({ ok: 1 });
  });

  it('should inject mongo connection to the service', async () => {
    const mongoConnectionInjected = Container.get(mongoose.Connection);
    expect(mongoConnectionInjected).toBeDefined();
    expect(mongoConnectionInjected).toEqual(mongoConnection);
  });
});
