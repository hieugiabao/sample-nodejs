import * as glob from 'glob';
import * as path from 'path';

export const importFiles = async (filePaths: string[]) => {
  await Promise.all(filePaths.map((filePath) => import(filePath)));
};

export const loadFiles = (filePattern: string[]): string[] => {
  return filePattern
    .map((pattern) =>
      glob
        .sync(pattern)
        .map((filePath) => path.resolve(process.cwd(), filePath)),
    )
    .reduce((acc, filePath) => acc.concat(filePath), []);
};
