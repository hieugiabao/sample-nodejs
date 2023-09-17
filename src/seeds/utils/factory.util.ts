import { ObjectType } from 'typeorm';

export const isPromiseLike = (o: any): boolean =>
  !!o &&
  (typeof o === 'object' || typeof o === 'function') &&
  typeof o.then === 'function' &&
  !(o instanceof Date);

export const getNameOfEntity = <T>(entity: ObjectType<T>): string => {
  if (entity instanceof Function) {
    return entity.name;
  } else if (entity) {
    return new (entity as any)().constructor.name;
  }
  throw new Error('Entity is not defined');
};
