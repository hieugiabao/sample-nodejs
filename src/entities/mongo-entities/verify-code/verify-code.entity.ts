import mongoose from 'mongoose';
import { IVerifyCode } from './verify-code.interface';

const Schema = mongoose.Schema;

const VerifyCodeSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    expireIn: {
      type: Number,
      unique: false,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required: true,
      expires: 60 * 10,
    },
  },
  { timestamps: true },
);

const VerifyCodeModel = mongoose.model<IVerifyCode & mongoose.Document>(
  'verify-code',
  VerifyCodeSchema,
);

export default VerifyCodeModel;
