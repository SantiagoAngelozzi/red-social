import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { IdParamDto } from '../publicaciones/dto/id-param.dto.js';

@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post('publicaciones/:id/comentarios')
  crear(@Param() params: IdParamDto, @Body() datos: CrearComentarioDto) {
    return this.comentariosService.crear(params.id, datos);
  }

  @Get('publicaciones/:id/comentarios')
  listar(@Param() params: IdParamDto, @Query() filtros: ListarComentariosDto) {
    return this.comentariosService.listar(params.id, filtros);
  }
}