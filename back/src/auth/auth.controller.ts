import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../file/opciones-imagen.js';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  registrar(@Body() datos: RegistroDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.authService.registrar(datos, imagen);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  autorizar(@Headers('authorization') authorization?: string) {
    return this.authService.autorizar(authorization);
  }

  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  refrescar(@Headers('authorization') authorization?: string) {
    return this.authService.refrescar(authorization);
  }
}