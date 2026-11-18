import { Body, Controller, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../file/opciones-imagen.js';
import { TokenGuard } from '../auth/guards/token.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioDocument } from './schemas/usuario.schema.js';
import { UsuariosService } from './usuarios.service.js';
import { EditarPerfilDto } from './dto/editar-perfil.dto.js';

@Controller('perfil')
@UseGuards(TokenGuard)
export class PerfilController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Patch()
  @UseInterceptors(FileInterceptor('imagenPerfil', opcionesImagen))
  editar(
    @Body() datos: EditarPerfilDto,
    @UsuarioActual() usuario: UsuarioDocument,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.usuariosService.editarPerfil(usuario, datos, imagen);
  }
}
