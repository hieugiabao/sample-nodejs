import mongoose from 'mongoose';
import { IRefreshToken } from './refresh-token.interface';
import { config } from '@config/app';
const Schema = mongoose.Schema;

const RefreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    TTL: {
      type: Number,
      unique: false,
      required: true,
    },
    authenticationId: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: config.refresh_expires_in,
      default: Date.now,
    },
  },
  { timestamps: true },
);
const RefreshTokenModel = mongoose.model<IRefreshToken & mongoose.Document>(
  'refresh-token',
  RefreshTokenSchema,
);

export default RefreshTokenModel;
