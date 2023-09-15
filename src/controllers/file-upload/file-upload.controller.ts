import { StringUtils } from '@common/utils/string-utils';
import { config } from '@config/app';
import minioClient from '@config/minio';
import { ApiError } from '@models/api-error';
import { ResponseCodeEnum } from '@models/enums/response-code.enum';
import { StatusCodes } from 'http-status-codes';
import { JsonController, Post, UploadedFile } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController('/media')
export class FileUploadController {
  @Post('/upload-image')
  async uploadImage(
    @UploadedFile('image', { required: true })
    image: Express.Multer.File | null,
  ) {
    try {
      if (
        image == null ||
        (image.mimetype != 'image/jpeg' &&
          image.mimetype != 'image/png' &&
          image.mimetype != 'image/svg+xml' &&
          image.mimetype != 'image/webp' &&
          image.mimetype != 'image/gif')
      ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ResponseCodeEnum.C0009);
      }

      // size > 20MB
      if (image.size > 20000000) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ResponseCodeEnum.C0010);
      }

      // Store the file in MinIO
      const metaData = {
        'Content-Type': image.mimetype,
      };
      const fileMime = image.originalname.slice(
        image.originalname.lastIndexOf('.'),
        image.originalname.length,
      );

      const fileName =
        StringUtils.transformString(image.originalname) + Date.now() + fileMime;
      await minioClient.putObject(
        config.minio.bucketName,
        'image/' + fileName,
        image.buffer,
        metaData,
      );

      const fileUrl =
        `${config.minio.schema}://` +
        config.minio.endPoint +
        ':' +
        config.minio.port +
        '/' +
        config.minio.bucketName +
        '/image/' +
        fileName;

      return {
        message: 'Upload image successfully',
        fileUrl: fileUrl,
      };
    } catch (e) {
      throw new ApiError(
        e.httpCode || StatusCodes.INTERNAL_SERVER_ERROR,
        e.responseCode || ResponseCodeEnum.C0006,
        e.message || 'Error uploading image',
      );
    }
  }
}
