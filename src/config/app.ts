import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,

  app: {
    api_prefix: '/api',
    jsonLimit: '10mb',
  },

  postgres: {
    url: process.env.DB_POSTGRES_CONN_STRING,
    db_name: process.env.DB_POSTGRES_NAME,
  },
  mongo: {
    url: process.env.DB_MONGO_CONN_STRING,
  },
  redis: {
    url: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },

  timezone: process.env.TZ,

  jwt_secret: process.env.JWT_SECRET,
  jwt_expires_in: process.env.ACCESS_TOKEN_TIMEOUT,
  jwt_salt: Number(process.env.JWT_SALT) || 12,
  refresh_expires_in: process.env.REFRESH_TOKEN_TIMEOUT,

  email: {
    sender: process.env.SENDER,
    sender_mail: process.env.SENDER_MAIL,
    api_key: process.env.EMAIL_API_KEY,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME,
    schema: process.env.MINIO_SCHEMA || 'http',
  },
};

export type Config = typeof config;
