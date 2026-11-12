import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { FileModule } from '../file/file.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const DURACION_TOKEN_SEGUNDOS = 15 * 60;

@Module({
  imports: [
    UsuariosModule,
    FileModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: DURACION_TOKEN_SEGUNDOS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: PasswordHasher, useValue: new PasswordHasher() }],
})
export class AuthModule {}