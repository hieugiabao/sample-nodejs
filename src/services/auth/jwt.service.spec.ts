import { JwtService } from './jwt.service';

describe('JwtService', () => {
  const jwtService = new JwtService();

  describe('signAsync', () => {
    it('should sign a JWT token', async () => {
      const payload = { userId: 1 };
      const token = await jwtService.signAsync(payload);
      expect(token).toBeDefined();
    });
  });

  describe('verifyAsync', () => {
    it('should verify a JWT token', async () => {
      const payload = {
        username: 'test',
        role: 'user',
        email: 'test@mail.com',
      };
      const token = await jwtService.signAsync(payload);
      const decoded = jwtService.verifyAsync(token);
      expect(decoded.username).toEqual(payload.username);
    });

    it('should throw an error if the token is invalid', () => {
      expect(() => jwtService.verifyAsync('invalid-token')).toThrow();
    });

    it('should throw an error if the token is expired', async () => {
      const payload = { userId: 1 };
      const token = await jwtService.signAsync(payload, { expiresIn: 0 });
      expect(() => jwtService.verifyAsync(token)).toThrow();
    });
  });
});
