import { ResponseBuilder } from './response-builder';
import { ResponseTypeEnum } from '@models/enums/response-type.enum';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';

describe('ResponseBuilder', () => {
  describe('success', () => {
    it('should set the response type to success', () => {
      const response = new ResponseBuilder().success().build();
      expect(response.type).toEqual(ResponseTypeEnum.SUCCESS);
    });
  });

  describe('error', () => {
    it('should set the response type to error', () => {
      const response = new ResponseBuilder().error().build();
      expect(response.type).toEqual(ResponseTypeEnum.ERROR);
    });
  });

  describe('withData', () => {
    it('should set the response data', () => {
      const data = { foo: 'bar' };
      const response = new ResponseBuilder().withData(data).build();
      expect(response.data).toEqual(data);
    });
  });

  describe('withCode', () => {
    it('should set the response code and message', () => {
      const code = ResponseCodeEnum.C0000;
      const response = new ResponseBuilder().withCode(code).build();
      expect(response.code).toEqual(code);
      expect(response.message).toBeDefined();
    });
  });

  describe('withMessage', () => {
    it('should set the response message', () => {
      const message = 'Hello, world!';
      const response = new ResponseBuilder().withMessage(message).build();
      expect(response.message).toEqual(message);
    });
  });

  describe('withMeta', () => {
    it('should set the response meta', () => {
      const meta = { foo: 'bar' };
      const response = new ResponseBuilder().withMeta(meta).build();
      expect(response.meta).toEqual(meta);
    });
  });

  describe('withNextPageToken', () => {
    it('should set the response next page token', () => {
      const token = 'abc123';
      const response = new ResponseBuilder().withNextPageToken(token).build();
      expect(response.nextPageToken).toEqual(token);
    });

    it('should set the response next page token to null if the token is falsy', () => {
      const response = new ResponseBuilder().withNextPageToken(null).build();
      expect(response.nextPageToken).toBeNull();
    });
  });

  describe('withErrors', () => {
    it('should set the response errors', () => {
      const errors = [
        {
          property: 'foo',
          constraints: { isNotEmpty: 'foo should not be empty' },
        },
      ];
      const response = new ResponseBuilder().withErrors(errors).build();
      expect(response.errors).toEqual(errors);
    });
  });
});
