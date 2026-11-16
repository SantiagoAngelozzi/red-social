import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../file/opciones-imagen.js';
import { TokenGuard } from '../auth/guards/token.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioDocument } from './schemas/usuario.schema.js';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { UsuarioIdParamDto } from './dto/usuario-id-param.dto.js';

@Controller('usuarios')
@UseGuards(TokenGuard, AdminGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  async crear(@Body() datos: CrearUsuarioDto, @UploadedFile() imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(datos, imagen, datos.perfil);
    return this.usuariosService.sinPassword(usuario);
  }

  @Delete(':id')
  deshabilitar(@Param() params: UsuarioIdParamDto, @UsuarioActual() administrador: UsuarioDocument) {
    return this.usuariosService.deshabilitar(params.id, administrador);
  }

  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param() params: UsuarioIdParamDto) {
    return this.usuariosService.habilitar(params.id);
  }
}
