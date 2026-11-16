import { IsDateString, IsOptional, Matches } from 'class-validator';

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class RangoFechasDto {
  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'La fecha "desde" debe tener el formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha "desde" no es válida' })
  desde?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA, { message: 'La fecha "hasta" debe tener el formato AAAA-MM-DD' })
  @IsDateString({ strict: true }, { message: 'La fecha "hasta" no es válida' })
  hasta?: string;
}