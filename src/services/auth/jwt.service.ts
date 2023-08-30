import { config } from '@config/app';
import { JwtPayload } from '@models/jwt-payload';
import * as jwt from 'jsonwebtoken';
import { Service } from 'typedi';

@Service()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = config.jwt_secret;
    this.expiresIn = config.jwt_expires_in;
  }

  async signAsync(payload: any, options?: jwt.SignOptions): Promise<string> {
    const signOptions = Object.assign(
      {
        algorithm: 'HS256',
        expiresIn: this.expiresIn + 's',
      },
      options,
    );
    return jwt.sign(payload, this.secret, signOptions);
  }

  verifyAsync(token: string, options?: jwt.VerifyOptions): JwtPayload {
    return jwt.verify(token, this.secret, options) as JwtPayload;
  }
}
