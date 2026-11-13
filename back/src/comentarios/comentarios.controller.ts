import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TokenGuard } from '../auth/guards/token.guard.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { ListarComentariosDto } from './dto/listar-comentarios.dto.js';
import { IdParamDto } from '../publicaciones/dto/id-param.dto.js';
import { ComentarioIdParamDto } from './dto/comentario-id-param.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';

@Controller()
@UseGuards(TokenGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Post('publicaciones/:id/comentarios')
  crear(
    @Param() params: IdParamDto,
    @Body() datos: CrearComentarioDto,
    @UsuarioActual() usuario: UsuarioDocument,
  ) {
    return this.comentariosService.crear(params.id, usuario, datos);
  }

  @Get('publicaciones/:id/comentarios')
  listar(@Param() params: IdParamDto, @Query() filtros: ListarComentariosDto) {
    return this.comentariosService.listar(params.id, filtros);
  }

  @Put('comentarios/:id')
  editar(
    @Param() params: ComentarioIdParamDto,
    @Body() datos: EditarComentarioDto,
    @UsuarioActual() usuario: UsuarioDocument,
  ) {
    return this.comentariosService.editar(params.id, usuario, datos);
  }
}