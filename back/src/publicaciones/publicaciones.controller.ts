import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../file/opciones-imagen.js';
import { TokenGuard } from '../auth/guards/token.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { IdParamDto } from './dto/id-param.dto.js';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  crear(
    @Body() datos: CrearPublicacionDto,
    @UsuarioActual() usuario: UsuarioDocument,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(datos, usuario, imagen);
  }

  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  @Get(':id')
  buscarUna(@Param() params: IdParamDto) {
    return this.publicacionesService.buscarActiva(params.id);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param() params: IdParamDto, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.darMeGusta(params.id, usuario);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param() params: IdParamDto, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.quitarMeGusta(params.id, usuario);
  }

  @Delete(':id')
  eliminar(@Param() params: IdParamDto, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.eliminar(params.id, usuario);
  }
}