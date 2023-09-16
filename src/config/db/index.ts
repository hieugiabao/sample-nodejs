import { config } from '@config/app';
import * as Mongoose from 'mongoose';
import { logger } from '@common/logger';
import { DataSource } from 'typeorm';
import { connectionOptions } from './postgres';
import { Container } from 'typedi';

const mongoConnectionString = config.mongo.url;

export class Database {
  private static mongooseConnection: Mongoose.Connection;

  private static postgresConnect: DataSource;

  static async getMongoConnection(): Promise<Mongoose.Connection> {
    if (!this.mongooseConnection) {
      logger.info('Start connect mongo database');
      this.mongooseConnection = await Database.getMongoDBConnectRetry();
      logger.info('Connected to mongo database');
    }

    return this.mongooseConnection;
  }

  static async getPostgresConnection(): Promise<DataSource> {
    if (!this.postgresConnect?.isInitialized) {
      logger.info('Start connect postgres database');
      this.postgresConnect = await Database.getPostgresConnectRetry();
      Container.set({
        id: DataSource,
        type: DataSource,
        value: this.postgresConnect,
      });
      logger.info('Connected to postgres database');
    }

    return this.postgresConnect;
  }

  static async disConnectMongo() {
    if (!this.mongooseConnection) return;

    await Mongoose.disconnect();
    logger.info('Closed Mongo DB connection:)');
  }

  static async disConnectPostgres() {
    if (!this.postgresConnect?.isInitialized) return;

    await this.postgresConnect.destroy();
    logger.info('Closed postgres DB connection:)');
  }

  private static async getMongoDBConnectRetry({
    retries = 1,
    maxRetries = 3,
  }: {
    retries?: number;
    maxRetries?: number;
  } = {}): Promise<Mongoose.Connection> {
    try {
      const connect = await Mongoose.connect(mongoConnectionString);
      this.mongooseConnection = connect.connection;
      Container.set({
        id: Mongoose.Connection,
        type: Mongoose.Connection,
        value: connect.connection,
      });
      return this.mongooseConnection;
    } catch (error) {
      if (retries < maxRetries) {
        logger.info('ERROR DB connection:', error);
        logger.info('Retry DB connection times:', retries++);
        return Database.getMongoDBConnectRetry({ retries, maxRetries });
      }

      logger.info(
        `UNHANDLED ERROR mongo DB connection after ${maxRetries} times`,
      );
      throw error;
    }
  }

  private static async getPostgresConnectRetry({
    retries = 1,
    maxRetries = 3,
  }: {
    retries?: number;
    maxRetries?: number;
  } = {}): Promise<DataSource> {
    try {
      return await new DataSource(connectionOptions).initialize();
    } catch (error) {
      if (retries < maxRetries) {
        logger.error('ERROR postgres DB connection:', error);
        logger.info('Retry postgres DB connection times:', retries++);
        return Database.getPostgresConnectRetry({ retries, maxRetries });
      }

      logger.info(
        `UNHANDLED ERROR postgres DB connection after ${maxRetries} times`,
      );
      throw error;
    }
  }

  public static async initDataSource() {
    await Database.getPostgresConnection();
    await Database.getMongoConnection();
  }

  public static async close() {
    await Database.disConnectPostgres();
    await Database.disConnectMongo();
  }
}
