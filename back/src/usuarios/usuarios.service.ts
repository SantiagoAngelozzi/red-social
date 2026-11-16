import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { Usuario } from './schemas/usuario.schema.js';
import type { UsuarioDocument } from './schemas/usuario.schema.js';
import { FileService } from '../file/file.service.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';

const EDAD_MINIMA = 13;
const CARPETA_PERFILES = 'rocket-social/perfiles';

type PerfilUsuario = 'usuario' | 'administrador';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly passwordHasher: PasswordHasher,
    private readonly fileService: FileService,
  ) {}

  buscarPorCorreo(correo: string) {
    return this.usuarioModel.findOne({ correo: correo.toLowerCase() });
  }

  buscarPorNombreUsuario(nombreUsuario: string) {
    return this.usuarioModel.findOne({ nombreUsuario });
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id);
  }

  listar() {
    return this.usuarioModel.find().select('-password').sort({ createdAt: -1 });
  }

  async registrar(datos: RegistroDto, imagen?: Express.Multer.File, perfil: PerfilUsuario = 'usuario') {
    const nacimiento = new Date(datos.fechaNacimiento);
    if (nacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura');
    }
    if (this.calcularEdad(nacimiento) < EDAD_MINIMA) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años para registrarte`);
    }

    if (await this.buscarPorCorreo(datos.correo)) {
      throw new ConflictException('Ese correo ya está registrado');
    }
    if (await this.buscarPorNombreUsuario(datos.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    const passwordHasheada = await this.passwordHasher.hash(datos.password);

    const imagenPerfil = imagen
      ? await this.fileService.cloudinaryUploader(imagen, CARPETA_PERFILES)
      : null;

    return this.usuarioModel.create({
      ...datos,
      fechaNacimiento: nacimiento,
      password: passwordHasheada,
      imagenPerfil,
      perfil,
    });
  }

  async deshabilitar(id: string, administrador: UsuarioDocument) {
    if (administrador._id.equals(id)) {
      throw new BadRequestException('No podés deshabilitarte a vos mismo');
    }
    return this.cambiarEstado(id, false);
  }

  habilitar(id: string) {
    return this.cambiarEstado(id, true);
  }

  sinPassword(usuario: UsuarioDocument) {
    const { password: _password, ...datos } = usuario.toObject();
    return datos;
  }

  private async cambiarEstado(id: string, activo: boolean) {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { activo }, { returnDocument: 'after' })
      .select('-password');
    if (!usuario) {
      throw new NotFoundException('El usuario no existe');
    }
    return usuario;
  }

  private calcularEdad(nacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getUTCFullYear();
    const yaCumplio =
      hoy.getMonth() > nacimiento.getUTCMonth() ||
      (hoy.getMonth() === nacimiento.getUTCMonth() && hoy.getDate() >= nacimiento.getUTCDate());
    if (!yaCumplio) edad--;
    return edad;
  }
}