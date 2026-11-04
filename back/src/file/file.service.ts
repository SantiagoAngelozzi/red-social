import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  cloudinaryUploader(file: Express.Multer.File, carpeta = 'rocket-social'): Promise<string> {
    return new Promise((resolve, reject) => {
      const subida = cloudinary.uploader.upload_stream(
        { folder: carpeta, resource_type: 'image' },
        (error, resultado) => {
          if (error || !resultado) {
            return reject(new InternalServerErrorException('No se pudo subir la imagen'));
          }
          resolve(resultado.secure_url);
        },
      );
      subida.end(file.buffer);
    });
  }
}
