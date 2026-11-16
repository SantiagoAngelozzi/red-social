import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';
import { FileModule } from '../file/file.module.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]), FileModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, { provide: PasswordHasher, useValue: new PasswordHasher() }],
  exports: [UsuariosService, PasswordHasher],
})
export class UsuariosModule {}