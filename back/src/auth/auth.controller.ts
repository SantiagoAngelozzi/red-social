import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';


const TIPOS_DE_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const PESO_MAXIMO = 2 * 1024 * 1024;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagenPerfil', {
      storage: memoryStorage(),
      limits: { fileSize: PESO_MAXIMO },
      fileFilter: (_req, archivo, callback) => {
        if (!TIPOS_DE_IMAGEN.includes(archivo.mimetype)) {
          return callback(new BadRequestException('La imagen debe ser JPG, PNG o WEBP'), false);
        }
        callback(null, true);
      },
    }),
  )
  registrar(@Body() datos: RegistroDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.authService.registrar(datos, imagen);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }
}
