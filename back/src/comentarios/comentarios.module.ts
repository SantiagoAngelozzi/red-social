import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComentariosController } from './comentarios.controller.js';
import { ComentariosService } from './comentarios.service.js';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema.js';
import { PublicacionesModule } from '../publicaciones/publicaciones.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comentario.name, schema: ComentarioSchema }]),
    PublicacionesModule,
    UsuariosModule,
  ],
  controllers: [ComentariosController],
  providers: [ComentariosService],
})
export class ComentariosModule {}