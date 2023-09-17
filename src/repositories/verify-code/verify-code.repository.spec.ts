import { VerifyCodeRepository } from './verify-code.repository';
import VerifyCodeModel from '@entities/mongo-entities/verify-code/verify-code.entity';
import { TimeUtils } from '@common/utils/time-utils';

jest.mock('@entities/mongo-entities/verify-code/verify-code.entity');

describe('VerifyCodeRepository', () => {
  let repository: VerifyCodeRepository;

  beforeEach(() => {
    repository = new VerifyCodeRepository();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createVerifyCode', () => {
    it('should create a new verify code document', async () => {
      const accountId = 1;
      const email = 'test@example.com';

      jest.spyOn(VerifyCodeModel, 'deleteMany').mockResolvedValueOnce({
        exec: jest.fn().mockResolvedValueOnce(undefined),
      } as any);

      const createSpy = jest
        .spyOn(VerifyCodeModel, 'create')
        .mockResolvedValueOnce({
          code: expect.stringMatching(/^\d{6}$/),
          expireIn: TimeUtils.nextSeconds(60 * 10),
          email,
          user_id: accountId,
        } as any);

      const deleteSpy = jest
        .spyOn(repository, 'deleteVerifyCodes')
        .mockResolvedValueOnce(undefined as any);

      const result = await repository.createVerifyCode(accountId, email);

      expect(deleteSpy).toHaveBeenCalledWith(email);
      expect(createSpy).toHaveBeenCalledWith({
        code: expect.stringMatching(/^\d{6}$/),
        expireIn: TimeUtils.nextSeconds(60 * 10),
        email,
        user_id: accountId,
      });
      expect(result).toEqual({
        code: expect.stringMatching(/^\d{6}$/),
        expireIn: TimeUtils.nextSeconds(60 * 10),
        email,
        user_id: accountId,
      });
    });
  });

  describe('getVerifyCode', () => {
    it('should return a verify code document', async () => {
      const code = '123456';
      const email = 'test@example.com';
      const document = {
        code,
        expireIn: TimeUtils.nextSeconds(60 * 10),
        email,
        user_id: 1,
      };

      const findOneSpy = jest
        .spyOn(VerifyCodeModel, 'findOne')
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(document),
        } as any);

      const result = await repository.getVerifyCode(code, email);

      expect(findOneSpy).toHaveBeenCalledWith({
        code,
        email,
        expireIn: { $gt: TimeUtils.currentSeconds() },
      });
      expect(result).toEqual(document);
    });
  });

  describe('deleteVerifyCode', () => {
    it('should delete a verify code document', async () => {
      const code = '123456';
      const email = 'test@example.com';

      const deleteOneSpy = jest
        .spyOn(VerifyCodeModel, 'deleteOne')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(undefined),
        } as any);

      await repository.deleteVerifyCode(code, email);

      expect(deleteOneSpy).toHaveBeenCalledWith({
        code,
        email,
      });
    });
  });

  describe('deleteVerifyCodes', () => {
    it('should delete all verify code documents for an email', async () => {
      const email = 'test@example.com';

      const deleteManySpy = jest.spyOn(VerifyCodeModel, 'deleteMany');

      deleteManySpy.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(undefined),
      } as any);

      await repository.deleteVerifyCodes(email);

      expect(deleteManySpy).toHaveBeenCalledWith({
        email,
      });
    });
  });
});
