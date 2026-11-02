import { Module } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PasswordHasher, useValue: new PasswordHasher() },
  ],
})
export class AuthModule {}
