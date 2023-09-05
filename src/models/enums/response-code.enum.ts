import { logger } from '@common/logger';

export enum ResponseCodeEnum {
  /**
   * Internal server error
   */
  C0000 = 'C0000',

  /**
   * Resource not found
   */
  C0001 = 'C0001',

  /**
   * Forbidden
   */
  C0002 = 'C0002',

  /**
   * Unauthorized
   */
  C0004 = 'C0004',

  /**
   * Request parameters error
   */
  C0005 = 'C0005',

  /**
   * Something went wrong
   */
  C0006 = 'C0006',

  /**
   * Token schema wrong
   */
  C0007 = 'C0007',

  /**
   * No user found
   */
  C0008 = 'C0008',
}

const RESPONSE_CODE_MESSAGE_MAP: { [key in ResponseCodeEnum]: string } = {
  [ResponseCodeEnum.C0000]: 'Internal server error',
  [ResponseCodeEnum.C0001]: 'Resource not found',
  [ResponseCodeEnum.C0002]: 'Forbidden',
  [ResponseCodeEnum.C0004]: 'Unauthorized',
  [ResponseCodeEnum.C0005]: 'Request parameters error',
  [ResponseCodeEnum.C0006]: 'Something went wrong',
  [ResponseCodeEnum.C0007]: 'Token schema wrong',
  [ResponseCodeEnum.C0008]: 'No user found',
};

export const getMessage = (responseCode: ResponseCodeEnum): string => {
  if (RESPONSE_CODE_MESSAGE_MAP[responseCode]) {
    return RESPONSE_CODE_MESSAGE_MAP[responseCode];
  } else {
    logger.error('Response code not found in dictionary', responseCode);
    return null;
  }
};
