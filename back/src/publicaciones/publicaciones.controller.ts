import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { opcionesImagen } from '../file/opciones-imagen.js';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { IdParamDto } from './dto/id-param.dto.js';
import { MeGustaDto } from './dto/me-gusta.dto.js'; 

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen))
  crear(@Body() datos: CrearPublicacionDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.publicacionesService.crear(datos, imagen);
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
  darMeGusta(@Param() params: IdParamDto, @Body() datos: MeGustaDto) {
    return this.publicacionesService.darMeGusta(params.id, datos.usuarioId);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param() params: IdParamDto, @Body() datos: MeGustaDto) {
    return this.publicacionesService.quitarMeGusta(params.id, datos.usuarioId);
  }

  @Delete(':id')
  eliminar(@Param() params: IdParamDto, @Body() datos: MeGustaDto) {
    return this.publicacionesService.eliminar(params.id, datos.usuarioId);
  }
}