import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

const TIPOS_DE_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const PESO_MAXIMO = 2 * 1024 * 1024;

export const opcionesImagen = {
  storage: memoryStorage(),
  limits: { fileSize: PESO_MAXIMO },
  fileFilter: (
    _req: unknown,
    archivo: Express.Multer.File,
    callback: (error: Error | null, aceptar: boolean) => void,
  ) => {
    if (!TIPOS_DE_IMAGEN.includes(archivo.mimetype)) {
      return callback(new BadRequestException('La imagen debe ser JPG, PNG o WEBP'), false);
    }
    callback(null, true);
  },
};